import cv2
from ultralytics import YOLO
import sys

def main():
    print("==============================================")
    print("🚀 Caspian OS: YOLOv8 Real-Time Scanner 🚀")
    print("==============================================")
    print("Initializing YOLOv8 model... Please wait.")
    
    # Load YOLOv8 nano model (downloads automatically if missing)
    model = YOLO('yolov8n.pt')
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Ошибка: Не удалось получить доступ к веб-камере.")
        return

    print("✅ Камера готова!")
    print("Инструкция:")
    print("  - Наведите камеру на автомобили, грузовики или людей.")
    print("  - YOLO будет считать их количество в реальном времени.")
    print("  - Нажмите [Q] для выхода")
    print("==============================================")

    # COCO classes for vehicles: 2: car, 5: bus, 7: truck
    # For demo "thumbs up" hack, YOLO doesn't have "thumb". We'll count "person" (class 0) as "Driver/Courier"
    # and vehicles as "Cargo Vehicles".

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Ошибка чтения с камеры.")
            break

        # Run YOLO detection
        results = model(frame, verbose=False)
        
        # Get annotated frame with bounding boxes
        annotated_frame = results[0].plot()
        
        # Count vehicles
        car_count = 0
        truck_count = 0
        person_count = 0
        
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            if cls_id == 2:  # car
                car_count += 1
            elif cls_id == 7 or cls_id == 5:  # truck or bus
                truck_count += 1
            elif cls_id == 0:  # person
                person_count += 1
                
        # Draw counts on the screen
        total_vehicles = car_count + truck_count
        
        # Overlay UI
        overlay = annotated_frame.copy()
        cv2.rectangle(overlay, (10, 10), (350, 150), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, annotated_frame, 0.4, 0, annotated_frame)
        
        cv2.putText(annotated_frame, f"TRUCKS: {truck_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(annotated_frame, f"CARS: {car_count}", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(annotated_frame, f"PEOPLE (Couriers): {person_count}", (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 100, 100), 2)

        # Show the frame
        cv2.imshow("Caspian YOLO Scanner (Press Q to exit)", annotated_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("Закрытие сканера...")
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
