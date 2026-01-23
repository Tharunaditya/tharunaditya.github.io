#!/bin/bash

# Author: Sneha Cheedalla and Tharunaditya Anuganti 
# Date Created: 27/07/2023
# Description: This script helps to automate Recon phase

#user input fields
target=$1
scanoption=$2
#colors
WHITECOLOR="\e[1;97m"
GREENCOLOR="\e[1;32m"
BLUECOLOR="\e[1;34m"
CYANCLOLOR="\e[1;36m"
ENDCOLOR="\e[0m"

#Banner 
sudo apt-get install figlet
printf "$GREENCOLOR"
figlet BugHunterX v1.0
printf "$WHITECOLOR                       By Sneha Cheedalla and Tharunaditya Anuganti "
printf "\n$GREENCOLOR#######################################################################\n"
echo -e "\n$BLUECOLOR [+] Downloading necessary tools...$ENDCOLOR"

if [ ! -d $target ]
then
    mkdir $target
fi

cd $target
pwd=$(pwd)

mkdir results
sudo apt --assume-yes install python3-pip
pip install dirsearch
sudo apt-get --assume-yes install nmap
wget https://github.com/projectdiscovery/nuclei/releases/download/v2.9.9/nuclei_2.9.9_linux_amd64.zip
unzip nuclei_2.9.9_linux_amd64.zip
wget https://github.com/projectdiscovery/nuclei-templates/archive/refs/tags/v9.5.8.zip
unzip v9.5.8.zip
wget https://github.com/projectdiscovery/notify/releases/download/v1.0.5/notify_1.0.5_linux_amd64.zip
unzip notify_1.0.5_linux_amd64.zip

echo -e "\n$BLUECOLOR Started the Analysis...\n"

if [ $scanoption == subdomain ];
then
  echo -e "\n$CYANCLOLOR [+] Finding subdomains with subfinder... $ENDCOLOR\n"
  wget https://github.com/projectdiscovery/subfinder/releases/download/v2.6.1/subfinder_2.6.1_linux_amd64.zip
  sudo apt-get install unzip
  unzip subfinder_2.6.1_linux_amd64.zip
  ./subfinder -d $target -o domains.txt
  $target >> domains.txt
  echo $target >> doamins.txt

  echo -e "\n$CYANCLOLOR [+] Performing subdomain takeover with sub404...$ENDCOLOR\n"
  git clone https://github.com/r3curs1v3-pr0xy/sub404.git
  cd sub404
  pip3 install -r requirements.txt
  python3 sub404.py -f $pwd/domains.txt -o $pwd/subdomain_takeover.txt

fi

cd $pwd
if [ ! -e domains.txt ];
then
  echo -e "\n$CYANCLOLOR [+] Fuzzing for directories using dirsearch...$ENDCOLOR\n"
  dirsearch -u $target -e php,html,js,zip -r --max-recursion-depth 3 --exclude-status 500,404,429 --recursion-status 200,301,403 -t 10 -o dirsearch_output.txt
  
  echo -e "\n$CYANCLOLOR [+] Performing portscan with NMAP...$ENDCOLOR\n"
  nmap $target -oN nmap_output.txt

  echo -e "\n$CYANCLOLOR [+] Running Nuclei...$ENDCOLOR\n"
  ./nuclei -t nuclei-templates-9.5.8/ -u $target -o nuclei_output.txt
else
  cd $pwd
  echo -e "\n$CYANCLOLOR [+] Fuzzing for directories using dirsearch...$ENDCOLOR\n"
  dirsearch -l domains.txt -e php,html,js,zip -r --max-recursion-depth 3 --exclude-status 500,404,429 --recursion-status 200,301,403 -t 10 -o dirsearch_output.txt
  
  echo -e "\n$CYANCLOLOR [+] Performing portscan with NMAP...$ENDCOLOR\n"
  nmap -iL domains.txt -oN nmap_output.txt

  echo -e "\n$CYANCLOLOR [+] Running Nuclei...$ENDCOLOR\n"
  ./nuclei -t nuclei-templates-9.5.8/ -l domains.txt -o nuclei_output.txt
fi

cat > providers.yaml << ENDOFFILE
discord:
  - id: "subs"
    discord_webhook_url: "https://discord.com/api/webhooks/1136387904415989872/1fexB3p7se6NL1i9ewnm-Vr3s8LQcxRYTZCj4-CQQmrUhNCbml25dsstppZwlnYBOOVl"
ENDOFFILE

echo -e "\n$CYANCLOLOR [+] Running OWASP ZAP...$ENDCOLOR\n"
docker run --user $(id -u):$(id -g) -w /zap -v $(pwd):/zap/wrk:rw --rm owasp/zap2docker-stable:2.10.0 zap-full-scan.py -t https://$target -r zap-output.html

echo -e "\n$CYANCLOLOR [+] Running Notify...$ENDCOLOR\n"

./notify -provider-config providers.yaml -data nuclei_output.txt
./notify -provider-config providers.yaml -data dirsearch_output.txt
./notify -provider-config providers.yaml -data subdomain_takeover.txt
./notify -provider-config providers.yaml -data nmap_output.txt
./notify -provider-config providers.yaml -data zap-output.html

echo -e "\n$CYANCLOLOR [+] Cleaning the unnecessary files ...$ENDCOLOR\n"
cp nuclei_output.txt dirsearch_output.txt subdomain_takeover.txt nmap_output.txt zap-output.html results/

shopt -s extglob
rm -rf !(results)
shopt -u extglob

echo -e "\n$GREENCOLOR [+] Done"

