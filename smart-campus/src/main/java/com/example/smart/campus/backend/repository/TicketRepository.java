package com.example.smart.campus.backend.repository;

import com.example.smart.campus.backend.model.Ticket;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReportedByUserId(String userId);
    List<Ticket> findByAssignedToUserId(String userId);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
}
