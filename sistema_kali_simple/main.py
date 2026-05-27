import os
import time
import random
import shutil
from colorama import Fore, init

init(autoreset=True)

os.system("clear")
os.system("toilet -f big 'KALI LINUX'")

banner = r'''
██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██╗╚██╗██╔╝
█████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██╗ ╚███╔╝
██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██╗ ██╔██╗
██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝
'''

def show_banner(text):
    try:
        width = shutil.get_terminal_size().columns
        print(Fore.RED + "\n".join(line.center(width) for line in text.split("\n")))
    except:
        print(Fore.RED + text)

show_banner(banner)

os.system("clear")

print(Fore.RED + "\n==============================")
print(Fore.RED + "         KALI LINUX")
print(Fore.RED + "==============================")

# ─────────────────────────────
# PROCESOS
# ─────────────────────────────

procesos = [
    "Iniciando módulo de ciberseguridad",
    "Conectando modo remoto",
    "Verificando acceso seguro",
    "Accediendo a base de datos remota",
    "Analizando registros del sistema",
    "Escaneando puertos vulnerables",
    "Iniciando monitoreo en tiempo real",
    "Detectando conexiones activas",
    "Analizando paquetes TCP/IP",
    "Inspeccionando tráfico sospechoso",
    "Buscando vulnerabilidades críticas",
    "Sincronizando telemetría del nodo",
    "Verificando firewall principal",
    "Cargando sistema..."
]

for p in procesos:
    print(Fore.GREEN + f"{p} 🔋")
    time.sleep(0.15)

# ─────────────────────────────
# CARGA SISTEMA
# ─────────────────────────────

print(Fore.YELLOW + "\nCARGANDO SISTEMA...\n")

for i in range(10):
    print(Fore.GREEN + "Sistema 🔋")
    time.sleep(0.2)

print(Fore.GREEN + "\n[✓] SISTEMA INICIADO\n")

# ─────────────────────────────
# PERFIL
# ─────────────────────────────

print(Fore.YELLOW + "\n===== PERFIL =====\n")

datos = [
    ("Nombre", "Daniel Enrique"),
    ("Apellidos", "Elio Ocampo"),
    ("Edad", "25 años"),
    ("Año de nacimiento", "2001"),
    ("DNI", "40587619"),
    ("Pais", "Peru"),
    ("Ciudad", "Lima"),
    ("Estado", "Soltero"),
    ("Trabajo", "Asistente Tecnico Redes"),
    ("Sistema", "macOS Sequoia"),
    ("Estado Dispositivo", "ONLINE")
]

for k, v in datos:
    print(Fore.CYAN + f"{k}: {v}")
    time.sleep(0.05)

# ─────────────────────────────
# RED
# ─────────────────────────────

print(Fore.MAGENTA + "\n===== RED GLOBAL =====\n")

network = [
    "TLS: ACTIVO",
    "FIREWALL: ON",
    "RED: ESTABLE",
    "LATENCIA: 18ms",
    "SERVIDORES: CONECTADOS"
]

for n in network:
    print(Fore.GREEN + f"{n} 🔋")
    time.sleep(0.1)

# ─────────────────────────────
# TELEMETRÍA
# ─────────────────────────────

print(Fore.RED + "\n===== TELEMETRÍA =====\n")

for i in range(20):
    up = random.randint(100, 900)
    down = random.randint(300, 1200)
    lat = random.randint(10, 40)

    print(
        Fore.GREEN +
        f"NODO-{random.randint(1000,9999)} "
        f"UP:{up} DOWN:{down} LAT:{lat} 🔋"
    )
    time.sleep(0.05)

print(Fore.GREEN + "\n[✓] FINALIZADO")

