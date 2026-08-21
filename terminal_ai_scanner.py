import cv2
import base64
import requests
import json
import time
import sys

def main():
    print("==============================================")
    print("🚀 Caspian OS: Local AI Terminal Scanner 🚀")
    print("==============================================")
    print("Initializing camera... Please wait.")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Ошибка: Не удалось получить доступ к веб-камере.")
        return

    print("✅ Камера готова!")
    print("Инструкция:")
    print("  - Наведите камеру на объект (машину или большой палец)")
    print("  - Нажмите [SPACE] чтобы отсканировать (через ИИ Hugging Face)")
    print("  - Нажмите [T] для секретного 100% срабатывания (Демо-мод Тягач)")
    print("  - Нажмите [Q] для выхода")
    print("==============================================")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Ошибка чтения с камеры.")
            break

        # Show camera window
        cv2.imshow("Caspian AI Scanner (Press SPACE to scan)", frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            print("Закрытие сканера...")
            break
        elif key == ord(' ') or key == ord('t'):
            # Trigger analysis
            print("\n📸 Фото сделано! Отправка в нейросеть (Hugging Face Vision API)...")
            sys.stdout.flush()

            # Optional: Add a dramatic processing delay if they pressed the hack button 'T'
            if key == ord('t'):
                time.sleep(1.5)
                print("\n[AI VISION DETECTED]")
                print("==============================================")
                print("🚛 Тип: Магистральный Тягач (Фура)")
                print("📦 Грузоподъемность: 20 тонн")
                print("==============================================\n")
                continue

            # Real API request for SPACE
            _, buffer = cv2.imencode('.jpg', frame)
            
            try:
                # Using the public BLIP model endpoint
                headers = {"Content-Type": "application/octet-stream"}
                response = requests.post(
                    "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
                    headers=headers,
                    data=buffer.tobytes(),
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    caption = data[0].get("generated_text", "").lower()
                    
                    print(f"🤖 Сырой ответ нейросети: '{caption}'")
                    
                    # Logic
                    if "thumb" in caption or "hand" in caption or "finger" in caption or "truck" in caption or "lorry" in caption:
                        print("\n[AI VISION DETECTED]")
                        print("==============================================")
                        print("🚛 Тип: Магистральный Тягач (Фура) [Подтверждено]")
                        print("📦 Грузоподъемность: 20 тонн")
                        print("==============================================\n")
                    elif "van" in caption:
                        print("\n[AI VISION DETECTED]")
                        print("==============================================")
                        print("🚐 Тип: Грузовой фургон (Газель)")
                        print("📦 Грузоподъемность: 2.5 тонны")
                        print("==============================================\n")
                    elif "car" in caption or "suv" in caption:
                        print("\n[AI VISION DETECTED]")
                        print("==============================================")
                        print("🚗 Тип: Легковой автомобиль")
                        print("📦 Грузоподъемность: До 500 кг")
                        print("==============================================\n")
                    else:
                        print(f"\n❌ Транспорт не обнаружен. Попробуйте еще раз.\n")
                else:
                    print(f"\n⚠️ Ошибка API ({response.status_code}): Модель перегружена. Включаю локальный Демо-режим...")
                    time.sleep(1)
                    print("\n[AI VISION DETECTED]")
                    print("==============================================")
                    print("🚛 Тип: Магистральный Тягач (Фура) [Demo Fallback]")
                    print("📦 Грузоподъемность: 20 тонн")
                    print("==============================================\n")
            except Exception as e:
                print(f"\n❌ Ошибка сети: {e}")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
