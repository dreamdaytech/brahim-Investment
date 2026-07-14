import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// POST /api/admin/create-user
// Creates a new user using the service role key (bypasses signup restrictions).
// This endpoint should only be callable by authenticated super admins.
router.post('/admin/create-user', express.json(), async (req, res) => {
  const serviceRoleKey = process.env.SERVICE_ROLE_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Server is missing required environment variables.' });
  }

  // Create an admin client using the service role key (server-side only)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, fullName, role.' });
  }

  try {
    // Step 1: Create the auth user via the admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so user can log in immediately
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Step 2: Upsert the user_roles row with the name and role
    const { error: roleError } = await adminClient.from('user_roles').upsert({
      id: userId,
      email: email,
      full_name: fullName,
      role: role,
      is_active: true,
    });

    if (roleError) {
      // Clean up: delete the auth user if role insertion fails
      await adminClient.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: `User created but role assignment failed: ${roleError.message}` });
    }

    return res.status(200).json({ success: true, userId });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
  }
});

// POST /api/admin/update-user
// Updates a user's details (email, password, full_name, role)
router.post('/admin/update-user', express.json(), async (req, res) => {
  const serviceRoleKey = process.env.SERVICE_ROLE_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Server is missing required environment variables.' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { id, email, password, fullName, role } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required field: id.' });
  }

  try {
    // Step 1: Update auth user (if email or password is provided)
    const authUpdates = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
    }

    // Step 2: Update user_roles table
    const roleUpdates = {};
    if (email) roleUpdates.email = email;
    if (fullName) roleUpdates.full_name = fullName;
    if (role) roleUpdates.role = role;

    if (Object.keys(roleUpdates).length > 0) {
      const { error: roleError } = await adminClient.from('user_roles').update(roleUpdates).eq('id', id);
      if (roleError) {
        return res.status(500).json({ error: `Auth updated but role update failed: ${roleError.message}` });
      }
    }

    return res.status(200).json({ success: true, userId: id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
  }
});

export default router;
