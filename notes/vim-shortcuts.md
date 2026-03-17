# Vim Shortcuts — Quick Familiarization

This cheat sheet is a concise, practical set of Vim shortcuts and tiny workflows to help you get comfortable quickly.

## Basics
- Modes: Normal (navigate/edit), Insert (type), Visual (select), Command (:) for ex-commands.
- Enter insert mode: `i` (before), `I` (line start), `a` (after), `A` (line end), `o` (new line below), `O` (above)
- Return to normal mode: `Esc` or `Ctrl-[`

## Movement (normal mode)
- Character: `h` `j` `k` `l`
- Word: `w` (next), `b` (back), `e` (end)
- Start / End of line: `0` (start), `^` (first non-blank), `$` (end)
- Jump to nth line: `:n` or `nG` (e.g. `5G`)
- Move by screen/display: `H` (top), `M` (middle), `L` (bottom)
- Paragraph and sentence: `{` `}` and `( ` `)`
- Find char forward/back: `f<char>` `F<char>`; till: `t<char>` `T<char>`

## Editing (normal)
- Delete: `x` (char), `dd` (line), `d{motion}` (e.g. `dw`, `d$`)
- Change: `cw` (change word), `cc` (change line), `c{motion}`
- Yank (copy): `yy` (line), `y{motion}`
- Paste: `p` (after), `P` (before)
- Replace char: `r<char>`
- Undo / Redo: `u` / `Ctrl-r`

## Visual mode
- Enter: `v` (charwise), `V` (linewise), `Ctrl-v` (blockwise)
- Then use `y` `d` `c` `>` `<` to act on selection

## Searching & Replace
- Search forward/backward: `/pattern` and `?pattern` then `n` / `N` to navigate results
- Word under cursor search: `*` (forward) `#` (back)
- Replace in line: `:s/old/new/g`
- Replace in file: `:%s/old/new/gc` (add `c` to confirm each)

## Buffers, Windows, Tabs
- List buffers: `:ls` or `:buffers`
- Switch buffer: `:b <num>` or `:bnext` (`:bn`) / `:bprev` (`:bp`)
- Open split vertically/horizontally: `:vsplit` (`:vsp`) / `:split` (`:sp`)
- Move between windows: `Ctrl-w h/j/k/l` or `Ctrl-w w`
- Resize: `Ctrl-w >` / `<` / `+` / `-` or `:resize` / `:vertical resize`
- Tabs: `:tabnew` to open, `gt` / `gT` to move between tabs

## Marks & Jumps
- Set a mark: `m{a-z}` (e.g. `ma`)
- Jump to mark: `` `{a-z} `` (position) or `'a` (line)
- Jump back to previous position: `Ctrl-o`; forward: `Ctrl-i`

## Registers
- Yank/delete into named register: `"ayy` (register a), paste from register: `"ap`
- Default yank/paste uses `"` (unnamed) and system clipboard often `+` or `*` depending on build
- Use system clipboard: `"+y` / `"+p` (if Vim has clipboard support)

## Macros
- Start recording: `q{reg}` (e.g. `qa`)
- Stop recording: `q`
- Play macro: `@{reg}` (e.g. `@a`), repeat: `@@` or `10@a`

## Ex Commands & File
- Write file: `:w`
- Quit: `:q`; force quit: `:q!`; write and quit: `:wq` or `:x`
- Open file: `:e filename`
- Read file into buffer: `:r filename`

## Useful One-liners
- Duplicate current line: `yyp` or `:t.`
- Join next line: `J`
- Indent selection/right shift: `>`; left shift: `<`
- Sort selected lines: `:sort` (use in visual selection)

## Tiny Workflows
- Replace word under cursor throughout file:
	- Place cursor on word, then `:%s/\\<C-r><C-w>\\>/replacement/g` (or use confirm `c`)
- Delete from cursor to end of line and enter insert: `C` (equivalent to `c$`)
- Change a word quickly: `ciw` (change inner word)

## Tips for Returning Users
- Spend 10 minutes daily doing small edits with only normal-mode commands to regain muscle memory.
- Map `jj` to `Esc` in `init.vim` or `.vimrc` (optional) if you prefer not reaching for `Esc`:
	- `inoremap jj <Esc>`
- Enable line numbers: `:set number` and relative numbers: `:set relativenumber`
- Turn on mouse for quick selections (optional): `:set mouse=a`

## Short Practice Exercises
- Move to a word, `ciw` and type a replacement.
- Use visual-line `V` and `>` twice to indent a paragraph.
- Record a macro to change the format of several similar lines, then replay with `@a`.

## Resources
- Built-in help: `:help` and `:help <topic>` (e.g. `:help motion.txt`)
- Vim Tutor: run `vimtutor` in your terminal for a guided refresher.

---
If you'd like, I can add a printable condensed two-page PDF, create a set of custom mappings for your workflow, or include a tiny `.vimrc` starter. Which would you prefer?
