# Progresso — Harpia API

- **[2026-07-10] — Novo schema (arquitetura de incorporadora):** Reescrito o `schema.prisma` para o modelo de plataforma de gestão de incorporadoras — Person (com PersonRole), Company (SPE/Incorporadora), BankAccount, Development (evolução de Project), UnitType, Unit, PriceTable, UnitPrice, e o fluxo Investment → Allocation → Return. Migration `new-architecture` aplicada (banco resetado; só havia seed). 16 tabelas criadas.
