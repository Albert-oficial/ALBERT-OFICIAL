import os
import time
import random
from colorama import Fore, init

init(autoreset=True)

os.system("clear")

print(Fore.RED + r"""
██╗  ██╗ █████╗ ██╗     ██╗
██║ ██╔╝██╔══██╗██║     ██║
█████╔╝ ███████║██║     ██║
██╔═██╗ ██╔══██║██║     ██║
██║  ██╗██║  ██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝
""")

nombre = input(Fore.CYAN + "\n[+] TARGET NAME : ")
ip = input(Fore.CYAN + "[+] TARGET IP : ")
region = input(Fore.CYAN + "[+] REGION : ")
pais = input(Fore.CYAN + "[+] COUNTRY : ")

comandos = [
    "Connecting to remote server...",
    "Bypassing firewall...",
    "Injecting payload...",
    "Scanning target ports...",
    "Decrypting database...",
    "Obtaining root access...",
    "Initializing exploit...",
    "Extracting credentials..."
]

print(Fore.GREEN + "\n[ SYSTEM INITIALIZED ]\n")

for i in range(20):
    cmd = random.choice(comandos)
    print(Fore.GREEN + "[+] " + cmd)
    time.sleep(0.3)

print(Fore.YELLOW + "\n[ TARGET INFORMATION ]\n")

time.sleep(1)

print(Fore.CYAN + f"NAME    : {nombre}")
time.sleep(0.5)

print(Fore.CYAN + f"IP      : {ip}")
time.sleep(0.5)

print(Fore.CYAN + f"REGION  : {region}")
time.sleep(0.5)

print(Fore.CYAN + f"COUNTRY : {pais}")
time.sleep(0.5)

print(Fore.RED + "\n[✓] ROOT ACCESS GRANTED")
print(Fore.GREEN + "[✓] FULL CONTROL ENABLED")
