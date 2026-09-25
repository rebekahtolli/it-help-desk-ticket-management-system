package com.helpdesk.helpdesk_backend.exception;

public class TicketValidationException extends RuntimeException {

    public TicketValidationException(String message) {
        super(message);
    }
}
