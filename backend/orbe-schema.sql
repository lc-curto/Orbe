
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `card_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_invoices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `card_id` bigint unsigned NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `cycle_state` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `open_card_key` bigint unsigned GENERATED ALWAYS AS (if((`cycle_state` = _utf8mb4'OPEN'),`card_id`,NULL)) STORED,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `card_invoices_card_id_period_start_period_end_unique` (`card_id`,`period_start`,`period_end`),
  UNIQUE KEY `card_invoices_open_card_key_unique` (`open_card_key`),
  KEY `card_invoices_user_id_foreign` (`user_id`),
  CONSTRAINT `card_invoices_card_id_foreign` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `card_invoices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_card_invoices_cycle_state` CHECK ((`cycle_state` in (_utf8mb4'PLANNED',_utf8mb4'OPEN',_utf8mb4'CLOSED'))),
  CONSTRAINT `chk_card_invoices_period` CHECK ((`period_start` <= `period_end`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `card_opening_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_opening_balances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `card_id` bigint unsigned NOT NULL,
  `operation_id` bigint unsigned NOT NULL,
  `declared_amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `card_opening_balances_card_id_unique` (`card_id`),
  UNIQUE KEY `card_opening_balances_operation_id_unique` (`operation_id`),
  KEY `card_opening_balances_user_id_foreign` (`user_id`),
  CONSTRAINT `card_opening_balances_card_id_foreign` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `card_opening_balances_operation_id_foreign` FOREIGN KEY (`operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `card_opening_balances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_card_opening_balances_amount` CHECK ((`declared_amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_limit` decimal(19,4) NOT NULL,
  `closing_day` tinyint unsigned DEFAULT NULL,
  `due_day` tinyint unsigned DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cards_user_id_name_unique` (`user_id`,`name`),
  CONSTRAINT `cards_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_cards_closing_day` CHECK (((`closing_day` is null) or (`closing_day` between 1 and 31))),
  CONSTRAINT `chk_cards_credit_limit` CHECK ((`credit_limit` >= 0)),
  CONSTRAINT `chk_cards_due_day` CHECK (((`due_day` is null) or (`due_day` between 1 and 31)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `debts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debt_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debts_user_id_foreign` (`user_id`),
  CONSTRAINT `debts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `financial_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `financial_accounts_user_id_name_unique` (`user_id`,`name`),
  CONSTRAINT `financial_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `financial_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `operation_id` bigint unsigned NOT NULL,
  `account_id` bigint unsigned DEFAULT NULL,
  `invoice_id` bigint unsigned DEFAULT NULL,
  `debt_id` bigint unsigned DEFAULT NULL,
  `purchase_allocation_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `effect` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `financial_entries_user_id_foreign` (`user_id`),
  KEY `financial_entries_operation_id_foreign` (`operation_id`),
  KEY `financial_entries_account_id_foreign` (`account_id`),
  KEY `financial_entries_invoice_id_foreign` (`invoice_id`),
  KEY `financial_entries_debt_id_foreign` (`debt_id`),
  KEY `financial_entries_purchase_allocation_id_foreign` (`purchase_allocation_id`),
  CONSTRAINT `financial_entries_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `financial_entries_debt_id_foreign` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `financial_entries_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `card_invoices` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `financial_entries_operation_id_foreign` FOREIGN KEY (`operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `financial_entries_purchase_allocation_id_foreign` FOREIGN KEY (`purchase_allocation_id`) REFERENCES `purchase_allocations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `financial_entries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_financial_entries_amount` CHECK ((`amount` > 0)),
  CONSTRAINT `chk_financial_entries_destination` CHECK (((((`account_id` is not null) + (`invoice_id` is not null)) + (`debt_id` is not null)) = 1)),
  CONSTRAINT `chk_financial_entries_effect` CHECK ((`effect` in (_utf8mb4'INCREASE',_utf8mb4'DECREASE'))),
  CONSTRAINT `chk_financial_entries_state` CHECK ((`state` in (_utf8mb4'PENDING',_utf8mb4'REALIZED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `opening_balance_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opening_balance_adjustments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `source_distribution_id` bigint unsigned NOT NULL,
  `correction_operation_id` bigint unsigned NOT NULL,
  `adjustment_type` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_reduction_entry_id` bigint unsigned NOT NULL,
  `destination_increase_entry_id` bigint unsigned NOT NULL,
  `reverses_adjustment_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oba_source_distribution_fk` (`source_distribution_id`),
  KEY `oba_correction_operation_fk` (`correction_operation_id`),
  KEY `oba_source_reduction_fk` (`source_reduction_entry_id`),
  KEY `oba_destination_increase_fk` (`destination_increase_entry_id`),
  KEY `oba_reverses_adjustment_fk` (`reverses_adjustment_id`),
  CONSTRAINT `oba_correction_operation_fk` FOREIGN KEY (`correction_operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `oba_destination_increase_fk` FOREIGN KEY (`destination_increase_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `oba_reverses_adjustment_fk` FOREIGN KEY (`reverses_adjustment_id`) REFERENCES `opening_balance_adjustments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `oba_source_distribution_fk` FOREIGN KEY (`source_distribution_id`) REFERENCES `opening_balance_distributions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `oba_source_reduction_fk` FOREIGN KEY (`source_reduction_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_opening_balance_adjustments_amount` CHECK ((`amount` > 0)),
  CONSTRAINT `chk_opening_balance_adjustments_type` CHECK ((`adjustment_type` in (_utf8mb4'REDISTRIBUTION',_utf8mb4'REVERSAL')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `opening_balance_distributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opening_balance_distributions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `opening_balance_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned NOT NULL,
  `obligation_entry_id` bigint unsigned NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opening_balance_invoice_unique` (`opening_balance_id`,`invoice_id`),
  UNIQUE KEY `opening_balance_distributions_obligation_entry_id_unique` (`obligation_entry_id`),
  KEY `opening_balance_distributions_invoice_id_foreign` (`invoice_id`),
  CONSTRAINT `opening_balance_distributions_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `card_invoices` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `opening_balance_distributions_obligation_entry_id_foreign` FOREIGN KEY (`obligation_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `opening_balance_distributions_opening_balance_id_foreign` FOREIGN KEY (`opening_balance_id`) REFERENCES `card_opening_balances` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_opening_balance_distributions_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `operation_type` varchar(48) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `effective_at` timestamp NULL DEFAULT NULL,
  `planned_at` timestamp NULL DEFAULT NULL,
  `source_operation_id` bigint unsigned DEFAULT NULL,
  `idempotency_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `operations_user_id_idempotency_key_unique` (`user_id`,`idempotency_key`),
  KEY `operations_source_operation_id_foreign` (`source_operation_id`),
  CONSTRAINT `operations_source_operation_id_foreign` FOREIGN KEY (`source_operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `operations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_operations_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payment_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_allocations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `payment_operation_id` bigint unsigned NOT NULL,
  `settlement_entry_id` bigint unsigned NOT NULL,
  `obligation_entry_id` bigint unsigned NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_settlement_obligation_unique` (`settlement_entry_id`,`obligation_entry_id`),
  KEY `payment_allocations_payment_operation_id_foreign` (`payment_operation_id`),
  KEY `payment_allocations_obligation_entry_id_foreign` (`obligation_entry_id`),
  CONSTRAINT `payment_allocations_obligation_entry_id_foreign` FOREIGN KEY (`obligation_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payment_allocations_payment_operation_id_foreign` FOREIGN KEY (`payment_operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payment_allocations_settlement_entry_id_foreign` FOREIGN KEY (`settlement_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_payment_allocations_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payment_reversal_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_reversal_allocations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reversal_operation_id` bigint unsigned NOT NULL,
  `original_payment_allocation_id` bigint unsigned NOT NULL,
  `account_reversal_entry_id` bigint unsigned NOT NULL,
  `invoice_reversal_entry_id` bigint unsigned NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pra_reversal_operation_fk` (`reversal_operation_id`),
  KEY `pra_original_allocation_fk` (`original_payment_allocation_id`),
  KEY `pra_account_reversal_fk` (`account_reversal_entry_id`),
  KEY `pra_invoice_reversal_fk` (`invoice_reversal_entry_id`),
  CONSTRAINT `pra_account_reversal_fk` FOREIGN KEY (`account_reversal_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `pra_invoice_reversal_fk` FOREIGN KEY (`invoice_reversal_entry_id`) REFERENCES `financial_entries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `pra_original_allocation_fk` FOREIGN KEY (`original_payment_allocation_id`) REFERENCES `payment_allocations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `pra_reversal_operation_fk` FOREIGN KEY (`reversal_operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_payment_reversal_allocations_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `purchase_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_allocations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_operation_id` bigint unsigned NOT NULL,
  `invoice_id` bigint unsigned NOT NULL,
  `amount` decimal(19,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_allocations_purchase_operation_id_invoice_id_unique` (`purchase_operation_id`,`invoice_id`),
  KEY `purchase_allocations_invoice_id_foreign` (`invoice_id`),
  CONSTRAINT `purchase_allocations_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `card_invoices` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `purchase_allocations_purchase_operation_id_foreign` FOREIGN KEY (`purchase_operation_id`) REFERENCES `operations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_purchase_allocations_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

