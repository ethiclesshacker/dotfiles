# READ - See /usr/share/doc/bash-doc/examples in the bash-doc package.
# Set up custom prompt PS1

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi


HISTSIZE=100000
HISTFILESIZE=200000

alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias lh="ls -lAh"
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

BLUE="\033[1;36m"
STOP="\e[0m"
printf "${BLUE}"
figlet -c avs.dev
printf "${STOP}"
