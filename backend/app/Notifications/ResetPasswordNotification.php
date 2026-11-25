<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        $resetUrl = $frontendUrl.'/reset-password?token='.urlencode($this->token).'&email='.urlencode((string) $notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Recuperar a palavra-passe — Orbe')
            ->greeting('Olá!')
            ->line('Recebemos um pedido para definir uma nova palavra-passe na tua conta Orbe.')
            ->action('Definir nova palavra-passe', $resetUrl)
            ->line('Este link é válido durante 60 minutos. Se não fizeste este pedido, podes ignorar este email.');
    }
}
