package com.example.smart.campus.backend.service;



import com.example.smart.campus.backend.model.Notification;
import com.example.smart.campus.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(String userId, String message,
                                   Notification.NotificationType type, String referenceId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        notificationRepository.save(n);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(String id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return notificationRepository.save(n);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository
            .findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
