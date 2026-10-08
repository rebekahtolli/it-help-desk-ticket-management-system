package com.helpdesk.helpdesk_backend.repository;

import com.helpdesk.helpdesk_backend.model.Ticket;
import com.helpdesk.helpdesk_backend.model.TicketPriority;
import com.helpdesk.helpdesk_backend.model.TicketStatus;
import com.helpdesk.helpdesk_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByRequester(User requester);

    @Query("""
            SELECT t FROM Ticket t
            WHERE (:status IS NULL OR t.status = :status)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:categoryName IS NULL OR LOWER(t.category.name) = LOWER(:categoryName))
              AND (:keyword IS NULL
                   OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR t.id = :ticketId)
            ORDER BY t.createdAt DESC, t.id DESC
            """)
    List<Ticket> search(
            @Param("keyword") String keyword,
            @Param("ticketId") Long ticketId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryName") String categoryName);
}