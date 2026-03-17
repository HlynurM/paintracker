4.3 Keyboard Shortcuts Worth Knowing (Mac)

Shortcut            Action
Cmd+P               Quick file open
Cmd+Shift+P         Command palette
Cmd+B               Toggle sidebar
Ctrl+``             Toggle terminal
Cmd+D               Select next occurrence
Cmd+Shift+L         Select all occurrences
Option+Z            Toggle word wrap
Cmd+K Cmd+C         Comment selection
F12                 Go to definition
Shift+F12           Find all references
Cmd+.               Quick fix / auto-import



# Start interactive session (main mode)
claude

# Ask a one-off question and exit
claude "What does the fetchPressureData function do?"

# Run with a specific file in context
claude --file src/lib/db.ts "Explain the schema here"

# Allow Claude to make file edits (be deliberate with this)
# Inside the session, just describe what you want:
# "Add a TypeScript type for HeadacheEntry to src/types/index.ts"