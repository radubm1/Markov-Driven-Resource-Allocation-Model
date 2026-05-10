

# 🧠 **A Bijective, Markov‑Driven Resource Allocation Model with Stochastic Durations**

Acest proiect implementează un **model bijectiv pur** de alocare a resurselor, în care fiecare resursă poate fi în relație cu **exact un singur client** la un moment dat, iar clienții sunt complet **agnostici** față de starea resursei.  
Sistemul evoluează în pași discreți, folosind:

- **tranziții finite de stare** (`available → pending → confirmed → unavailable → available`)
- **memorie Markov de ordinul 1**
- **cozi FIFO nelimitate**
- **durate stocastice ale rezervărilor** (1–3 step‑uri)
- **injectare probabilistică de cereri**
- **bijecție strictă între resursă și clientul curent**

Modelul simulează fidel dinamica unui sistem real de rezervări: cozi care cresc, resurse ocupate variabil, confirmări instabile și competiție între clienți.

---

## 🔍 Ce face modelul

- Fiecare resursă are o stare finită și o memorie Markov.
- Clienții trimit cereri fără să știe starea resursei.
- Cozile pot crește oricât (FIFO, fără duplicări).
- Când o resursă devine `available` și există coadă → intră instant în `pending`.
- Confirmarea este probabilistică și influențată de starea anterioară.
- O rezervare confirmată are o durată aleatorie (1–3 step‑uri).
- În `unavailable`, durata scade până la eliberare.
- Modelul este 100% bijectiv: niciodată două relații simultane.

---

## 🔄 Diagrama logică a tranzițiilor

```
available
   │ queue>0
   ▼
pending ── confirm ──► confirmed ──► unavailable (busyFor = 1..3)
   │ reject                         │ busyFor→0
   ▼                                ▼
unconfirmed ◄──────────────────────── available
```

---

## 📈 Comportament emergent

Modelul produce:

- cozi dinamice și realiste  
- perioade de supraîncărcare  
- resurse cu durate variabile  
- competiție între clienți  
- instabilitate controlată prin Markov  
- lipsa totală a stărilor imposibile (`available + current + queue`)  

---

## 🧪 Exemplu de output real

```
R1: confirmed(C1), queue=[C5]
R2: unavailable(C6, busyFor=2)
R3: pending(C4)
```

```
R1: unavailable(C1, busyFor=1), queue=[C5]
R2: unavailable(C6, busyFor=1), queue=[C3]
R3: confirmed(C4)
```

```
R1: available, queue=[C5]
R2: available, queue=[C3,C7]
R3: unavailable(C4, busyFor=3), queue=[C7]
```

```
R1: pending(C5)
R2: pending(C3), queue=[C7]
R3: unavailable(C4, busyFor=2), queue=[C7,C5]
```

---

## 🧩 De ce e interesant

Acest model este un exemplu de:

- **sistem distribuit cu memorie locală**
- **proces Markovian cu cozi**
- **bijecție strictă între entități**
- **dinamică emergentă fără orchestrare globală**
- **simulare realistă a rezervărilor**

---

## 🛠 Tehnic

- TypeScript pur  
- fără framework  
- fără side‑effects ascunse  
- evoluție determinată de funcții pure  
- monadă simplă pentru compoziția step‑urilor  

---

## 🎯 Pentru cine e util

- cercetători în modele stocastice  
- designeri de sisteme de rezervări  
- oameni interesați de simulări discrete  
- pasionați de modele emergente  
- oricine vrea să vadă un model bijectiv pur în acțiune  
