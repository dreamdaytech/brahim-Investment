const fs = require('fs');
const path = 'src/components/AdminSection.tsx';
let content = fs.readFileSync(path, 'utf8');

const appendStr = `
      {/* Delete Confirm Modal — animated */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden z-10"
            >
              {/* Red top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">Remove Team Member?</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      You are about to permanently remove{' '}
                      <span className="font-bold text-slate-800">{confirmDelete.name}</span>{' '}
                      from the operational team. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Yes, Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

content = content.trimEnd() + '\n' + appendStr;
fs.writeFileSync(path, content);
console.log('Appended successfully');
