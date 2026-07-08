const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminProfile.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add props
content = content.replace(
  "export const AdminProfile: React.FC = () => {",
  "export const AdminProfile: React.FC<{ currentUserRole?: string }> = ({ currentUserRole }) => {"
);

// Add password state
content = content.replace(
  "const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);",
  "const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);\n  const [password, setPassword] = useState('');\n  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);"
);

// Add update password function
const handlePasswordUpdate = `
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };
`;

content = content.replace(
  "const handleSave = async (e: React.FormEvent) => {",
  handlePasswordUpdate + "\n  const handleSave = async (e: React.FormEvent) => {"
);

// Add password UI below the main form
const passwordUI = `
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" />
            Security
          </h2>

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
            {passwordMessage && (
              <div className={\`p-4 rounded-xl text-sm flex items-center gap-2 \${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}\`}>
                <AlertCircle size={16} />
                {passwordMessage.text}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                placeholder="Enter new password"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-shadow text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={!password || password.length < 6}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>
`;

content = content.replace(
  "</div>\n    </div>\n  );\n};",
  passwordUI + "      </div>\n    </div>\n  );\n};"
);

// Also display the currentUserRole somewhere nice
content = content.replace(
  /<h2 className="text-xl font-bold text-slate-900 mt-4">.*?<\/h2>/s,
  `<h2 className="text-xl font-bold text-slate-900 mt-4">
              {name || 'Admin User'}
            </h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">
              {currentUserRole ? currentUserRole.replace('_', ' ') : 'Administrator'}
            </p>`
);

fs.writeFileSync(filePath, content);
console.log('AdminProfile.tsx updated with password changing functionality.');
