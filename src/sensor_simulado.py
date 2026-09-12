import random
import time
from datetime import UTC, datetime

import requests

# Asegúrate de ajustar esta URL al endpoint real de tu API cuando lo construyas
API_URL = "http://localhost:8000/api/v1/lecturas"

def generar_lectura(punto_id, energia_acumulada):
    # Generar métricas realistas para un panel solar
    voltaje = round(random.uniform(30.0, 45.0), 2)
    corriente = round(random.uniform(5.0, 10.0), 2)
    potencia = round(voltaje * corriente, 2)
    
    # Acumular energía (potencia en Watts convertida a Wh por segundo)
    energia_acumulada = round(energia_acumulada + (potencia / 3600), 4)

    payload = {
        "timestamp": datetime.now(UTC).isoformat(),
        "voltaje": voltaje,
        "corriente": corriente,
        "potencia": potencia,
        "energia_acumulada": energia_acumulada,
        "punto_id": punto_id
    }
    return payload, energia_acumulada

if __name__ == "__main__":
    energia_actual = 0.0
    print("Iniciando simulación del sensor del panel solar...")
    
    while True:
        payload, energia_actual = generar_lectura(punto_id=1, energia_acumulada=energia_actual)
        try:
            response = requests.post(API_URL, json=payload)
            print(f"Enviado: {payload} - Estado: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Esperando a que la API esté disponible... (Error: {e})")
        
        time.sleep(5)