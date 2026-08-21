import cv2
import requests
import time
from ultralytics import YOLO

# Настройки
API_URL = "https://caspian-os-beta.vercel.app/api/traffic"
LOCATION_NAME = "6-й микрорайон, перекресток"
LAT = 43.6394
LNG = 51.1557
SEND_INTERVAL = 5 # Отправлять данные каждые 5 секунд

# Загружаем легкую модель YOLOv8 (скачается автоматически при первом запуске)
print("Loading YOLOv8 AI Model...")
model = YOLO('yolov8n.pt') 

# Подключаем USB камеру (0 - встроенная, 1 или 2 - внешняя USB)
# Если USB камера не работает, поменяйте 0 на 1
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Ошибка: Не удалось открыть камеру!")
    exit()

last_send_time = time.time()

print(f"AI Vision started. Sending data to {API_URL} every {SEND_INTERVAL} seconds...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Обрабатываем кадр нейросетью
    # classes=[2,3,5,7] - это индексы классов в COCO (2: car, 3: motorcycle, 5: bus, 7: truck)
    results = model(frame, classes=[2, 3, 5, 7], verbose=False)
    
    # Считаем количество машин
    car_count = len(results[0].boxes)
    
    # Отрисовка коробок (bounding boxes) для визуализации
    annotated_frame = results[0].plot()
    
    # Пишем текст на экране
    cv2.putText(annotated_frame, f"Cars detected: {car_count}", (20, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Показываем видео
    cv2.imshow("RayCast AI Traffic Vision", annotated_frame)
    
    # Отправка данных на сервер
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        payload = {
            "location": LOCATION_NAME,
            "lat": LAT,
            "lng": LNG,
            "car_count": car_count,
            "congestion_level": "HIGH" if car_count > 5 else "MEDIUM" if car_count > 2 else "LOW"
        }
        try:
            requests.post(API_URL, json=payload, timeout=2)
            print(f"✅ Sent data to server: {car_count} cars -> {payload['congestion_level']}")
        except Exception as e:
            print(f"❌ Failed to send data: {e}")
            
        last_send_time = current_time

    # Нажмите 'q' чтобы выйти
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
