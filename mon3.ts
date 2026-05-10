// -----------------------------
// 1. Tipuri de stare
// -----------------------------
type ResourceState =
  | "available"
  | "pending"
  | "confirmed"
  | "unconfirmed"
  | "unavailable";

// -----------------------------
// 2. Client + Resursă
// -----------------------------
interface Client {
  id: string;
  p: number;
}

interface Resource {
  id: string;
  state: ResourceState;
  memory: ResourceState[];
  queue: Client[];
  current?: Client | null;
  busyFor?: number;   // <-- DURATA RANDOM A REZERVĂRII
}

// -----------------------------
// 3. Decizia de confirmare
// -----------------------------
function decideConfirmation(resource: Resource, client: Client): boolean {
  const last = resource.memory.at(-1);

  const instability =
    last === "unconfirmed" ? -0.2 :
    last === "confirmed"   ? +0.2 :
    0;

  return Math.random() < client.p + instability;
}

// -----------------------------
// 4. Injectare cereri
// -----------------------------
function injectNewRequests(resources: Resource[], clients: Client[]): Resource[] {
  return resources.map(r => {
    if (Math.random() < 0.4) {
      const client = clients[Math.floor(Math.random() * clients.length)];

      const alreadyQueued =
        r.current?.id === client.id ||
        r.queue.some(c => c.id === client.id);

      if (alreadyQueued) return r;

      return { ...r, queue: [...r.queue, client] };
    }
    return r;
  });
}

// -----------------------------
// 5. Memorie Markov
// -----------------------------
function markovMemory(r: Resource): ResourceState[] {
  return [r.state];
}

// -----------------------------
// 6. Evoluția unei resurse (cu DURATĂ RANDOM)
// -----------------------------
function evolveResource(r: Resource): Resource {
  const last = r.state;

  // available → pending dacă există coadă
  if (last === "available") {
    if (r.queue.length > 0) {
      const [client, ...rest] = r.queue;
      return {
        ...r,
        memory: markovMemory(r),
        state: "pending",
        current: client,
        queue: rest
      };
    }
    return r;
  }

  // pending → confirmed / unconfirmed
  if (last === "pending" && r.current) {
    const confirmed = decideConfirmation(r, r.current);
    return {
      ...r,
      memory: markovMemory(r),
      state: confirmed ? "confirmed" : "unconfirmed"
    };
  }

  // unconfirmed → pending / available
  if (last === "unconfirmed") {
    if (r.queue.length > 0) {
      const [nextClient, ...rest] = r.queue;
      return {
        ...r,
        memory: markovMemory(r),
        state: "pending",
        current: nextClient,
        queue: rest
      };
    }
    return {
      ...r,
      memory: markovMemory(r),
      state: "available",
      current: null
    };
  }

  // confirmed → unavailable (cu DURATĂ RANDOM)
  if (last === "confirmed") {
    return {
      ...r,
      memory: markovMemory(r),
      state: "unavailable",
      current: r.current,
      busyFor: Math.floor(Math.random() * 3) + 1   // <-- 1,2,3 step-uri
    };
  }

  // unavailable → unavailable (scade durata)
  if (last === "unavailable") {

    // încă ocupat
    if (r.busyFor && r.busyFor > 1) {
      return {
        ...r,
        memory: markovMemory(r),
        busyFor: r.busyFor - 1
      };
    }

    // durata s-a terminat → devine available
    if (r.busyFor === 1) {
      return {
        ...r,
        memory: markovMemory(r),
        state: "available",
        current: null,
        busyFor: 0
      };
    }

    return r;
  }

  return r;
}

// -----------------------------
// 7. Monada sistemului
// -----------------------------
class SystemMonad {
  constructor(readonly resources: Resource[]) {}

  evolve(clients: Client[]): SystemMonad {
    const withNewRequests = injectNewRequests(this.resources, clients);
    const newResources = withNewRequests.map(r => evolveResource(r));
    return new SystemMonad(newResources);
  }
}

// -----------------------------
// 8. Setup + demo
// -----------------------------
const clients: Client[] = [
  { id: "C1", p: 0.9 }, { id: "C2", p: 0.6 },
  { id: "C3", p: 0.4 }, { id: "C4", p: 0.3 },
  { id: "C5", p: 0.2 }, { id: "C6", p: 0.8 },
  { id: "C7", p: 0.5 }, { id: "C8", p: 0.7 }
];

let system = new SystemMonad([
  { id: "R1", state: "available", memory: [], queue: [], current: null },
  { id: "R2", state: "available", memory: [], queue: [], current: null },
  { id: "R3", state: "available", memory: [], queue: [], current: null }
]);

for (let step = 0; step < 20; step++) {
  console.log(`\n=== STEP ${step} ===`);
  console.table(
    system.resources.map(r => ({
      id: r.id,
      state: r.state,
      lastMemory: r.memory.at(-1) ?? "-",
      current: r.current ? r.current.id : "-",
      busyFor: r.busyFor ?? "-",
      queue: r.queue.map(c => c.id).join(",") || "-"
    }))
  );

  system = system.evolve(clients);
}
