colorscheme ron

set nocompatible
set number
" set relativenumber
" for highlighting current line 
set cursorline
set showcmd
set showmode
set showmatch
set incsearch
set hlsearch
set ignorecase
set smartcase
set ruler
set confirm
" Remove this line if highlighting of spelling is annoying.
" set spell

" Next two lines for removing audio bell and turning off flash
set visualbell
set t_vb=
set cmdheight=2

" Next line is kinda...Idk
set laststatus=2

highlight LineNr term=bold cterm=NONE ctermfg=Grey ctermbg=Black 
autocmd BufWritePost *.tex !pdflatex <afile>

call plug#begin()
Plug 'preservim/NERDTree'
Plug 'preservim/nerdcommenter'
" Plug 'frazrepo/vim-rainbow'
Plug 'tpope/vim-surround'
Plug 'mattn/emmet-vim'
" Plug 'terryma/vim-multiple-cursors'
Plug 'mg979/vim-visual-multi', {'branch': 'master'}
Plug 'jiangmiao/auto-pairs'
Plug 'rust-lang/rust.vim'
Plug 'ap/vim-css-color'
Plug 'plasticboy/vim-markdown'
Plug 'luochen1990/rainbow'
call plug#end()

syntax enable
filetype indent on
set autoindent
set tabstop=2

let g:NERDSpaceDelims = 1
let g:NERDDefaultAlign = 'left'
let g:NERDCommentEmptyLines = 1
let g:rainbow_active = 1 

vnoremap <C-c> :call NERDComment('x','toggle')<CR>
nnoremap <C-c> v :call NERDComment('x','toggle')<CR>
nnoremap <C-b> :NERDTreeToggle<CR>

map <Space> :noh<cr>
