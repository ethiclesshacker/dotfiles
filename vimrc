colorscheme ron

set nocompatible
set number
" " set relativenumber
syntax on
set tabstop=4
set autoindent
" " for highlighting current line 
" " set cursorline
set showcmd
set showmode
set showmatch
set incsearch
set hlsearch
map <Space> :noh<cr>
set ignorecase
set smartcase
set ruler
set confirm
" " Remove this line if highlighting of spelling is annoying.
" " set spell

" " Next two lines for removing audio bell and turning off flash

set visualbell
set t_vb=

set cmdheight=2
" " Next line is kinda...Idk
set laststatus=2
" " filetype indent on
highlight LineNr term=bold cterm=NONE ctermfg=Grey ctermbg=Black 
" " NOT NECESSARY -->  gui=NONE guifg=DarkGrey guibg=NONE