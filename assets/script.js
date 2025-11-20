const state = {
  tasks: [
    {
      id: 1,
      title: "Frischetheke auffüllen",
      description: "Kontrolle der Kühlung und Nachfüllen der Ware",
      priority: "hoch",
      status: "offen",
      due: "Heute, 10:00",
      tags: ["Frische", "Qualität"],
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: 2,
      title: "Preisschilder aktualisieren",
      description:
        "Aktion 'Frische-Woche' – neue Preisträger in Regal 3A und 3B",
      priority: "mittel",
      status: "überfällig",
      due: "Seit gestern",
      tags: ["Aktionstag"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: 3,
      title: "Hygiene-Check",
      description: "Tägliche Kontrolle von Pausenraum und Sanitärbereichen",
      priority: "mittel",
      status: "offen",
      due: "Heute, 16:00",
      tags: ["Hygiene"],
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
    {
      id: 4,
      title: "Wareneingang erfassen",
      description:
        "Neue Lieferung Obst & Gemüse, Eingabe im Warenwirtschaftssystem",
      priority: "hoch",
      status: "offen",
      due: "Heute, 13:00",
      tags: ["Warenwirtschaft"],
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: 5,
      title: "Team-Briefing",
      description: "Besprechung der Verkäufe der letzten Woche",
      priority: "niedrig",
      status: "abgeschlossen",
      due: "Heute, 08:30",
      tags: ["Team"],
      createdAt: Date.now() - 1000 * 60 * 60 * 7,
    },
  ],
  currentUserName: "Anna",
  role: "lead", // 'lead' or 'staff'
  updates: [
    {
      id: 1,
      title: "Neue Hygiene-Richtlinie",
      content:
        "Bitte beachten: Aktualisierte Reinigungsvorgaben für Kühlketten ab KW47.",
      date: "Heute, 07:30",
    },
    {
      id: 2,
      title: "Aktion Frische-Woche",
      content:
        "Zentrale stellt Werbematerialien für die Aktion bereit. Bitte prominent platzieren.",
      date: "Gestern, 16:45",
    },
    {
      id: 3,
      title: "System-Update Warenwirtschaft",
      content:
        "Geplantes Update am Freitag, 22:00 Uhr. Kurzer Ausfall möglich.",
      date: "Gestern, 09:15",
    },
  ],
  guides: [
    {
      id: 1,
      title: "Warenwirtschaft Einstieg",
      description: "Schritt-für-Schritt-Anleitung zur Buchung von Wareneingängen",
    },
    {
      id: 2,
      title: "Kassensystem Schulung",
      description: "Video-Tutorial zur Bedienung des Kassensystems",
    },
    {
      id: 3,
      title: "Hygiene Checklisten",
      description: "Vorlage für tägliche Hygienekontrollen",
    },
    {
      id: 4,
      title: "Aktionsplanung",
      description: "Best Practices zur Vorbereitung von Aktionstagen",
    },
  ],
  events: [
    {
      id: 1,
      title: "Frische-Woche Start",
      description: "Promotionsaufbau und Sampling-Station einrichten",
      date: "Heute",
    },
    {
      id: 2,
      title: "Loyalty Programm",
      description: "Extra-Bonus Punkte für Stammkunden",
      date: "Morgen",
    },
    {
      id: 3,
      title: "Black Friday Vorbereitung",
      description: "Teambriefing und Nachbestellungen",
      date: "In 3 Tagen",
    },
  ],
  team: [
    {
      id: 1,
      name: "Anna Müller",
      role: "Filialleitung",
      shift: "06:00 - 14:00",
    },
    {
      id: 2,
      name: "Tobias Schmidt",
      role: "Stellv. Leitung",
      shift: "08:00 - 16:00",
    },
    {
      id: 3,
      name: "Jana Keller",
      role: "Frischetheke",
      shift: "10:00 - 18:00",
    },
    {
      id: 4,
      name: "Luis Berger",
      role: "Kasse",
      shift: "12:00 - 20:00",
    },
  ],
};

const selectors = {
  statToday: document.getElementById("stat-today"),
  statOverdue: document.getElementById("stat-overdue"),
  statUpdates: document.getElementById("stat-updates"),
  statGuides: document.getElementById("stat-guides"),
  taskList: document.getElementById("task-list"),
  tabButtons: document.querySelectorAll(".tab"),
  updatesList: document.getElementById("updates-list"),
  guidesList: document.getElementById("guides-list"),
  eventsList: document.getElementById("events-list"),
  teamList: document.getElementById("team-list"),
  sidebarDate: document.getElementById("sidebar-date"),
  newTaskBtn: document.getElementById("new-task-btn"),
  employeeBtn: document.getElementById("employee-switcher-btn"),
  globalSearch: document.getElementById("global-search"),
  tasksBadge: document.getElementById("tasks-badge"),
  welcome: document.querySelector(".welcome strong"),
  avatar: document.querySelector(".avatar"),
  // Modals
  modalBackdrop: document.getElementById("modal-backdrop"),
  taskModal: document.getElementById("task-modal"),
  detailsModal: document.getElementById("details-modal"),
  employeeModal: document.getElementById("employee-modal"),
  detailsContent: document.getElementById("details-content"),
  // Forms
  taskForm: document.getElementById("task-form"),
  taskId: document.getElementById("task-id"),
  taskTitle: document.getElementById("task-title"),
  taskDesc: document.getElementById("task-desc"),
  taskPriority: document.getElementById("task-priority"),
  taskDue: document.getElementById("task-due"),
  taskTags: document.getElementById("task-tags"),
  employeeForm: document.getElementById("employee-form"),
  employeeName: document.getElementById("employee-name"),
  // Toasts
  toastContainer: document.getElementById("toast-container"),
  // Toolbar controls
  selectAll: document.getElementById("select-all"),
  filterPriority: document.getElementById("filter-priority"),
  filterStatus: document.getElementById("filter-status"),
  sortSelect: document.getElementById("sort-select"),
  bulkComplete: document.getElementById("bulk-complete"),
  bulkDelete: document.getElementById("bulk-delete"),
  exportBtn: document.getElementById("export-btn"),
  importBtn: document.getElementById("import-btn"),
  importFile: document.getElementById("import-file"),
  selectionCount: document.getElementById("selection-count"),
  selectVisibleBtn: document.getElementById("select-visible"),
  invertSelectionBtn: document.getElementById("invert-selection"),
  clearSelectionBtn: document.getElementById("clear-selection"),
  roleToggle: document.getElementById("role-toggle"),
  // Page view (fullscreen)
  pageView: document.getElementById("page-view"),
  pageTitle: document.getElementById("page-title"),
  pageContent: document.getElementById("page-content"),
  pageBack: document.getElementById("page-back"),
  pageSearch: document.getElementById("page-search"),
};

const formatGermanDate = (date) =>
  date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  } catch (_) { return ""; }
};

const isOverdue = (task) => {
  if (task.status === "abgeschlossen") return false;
  if (!task.dueAt) return false;
  const t = new Date(task.dueAt).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
};

const renderStats = () => {
  const todayTasks = state.tasks.filter((task) => task.status !== "abgeschlossen");
  const overdueTasks = state.tasks.filter((task) => isOverdue(task));
  selectors.statToday.textContent = todayTasks.length;
  selectors.statOverdue.textContent = overdueTasks.length;
  selectors.statUpdates.textContent = state.updates.length;
  selectors.statGuides.textContent = state.guides.length;
  if (selectors.tasksBadge) selectors.tasksBadge.textContent = todayTasks.length;
};

const createTaskItem = (task) => {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.priority = task.priority;
  const overdue = isOverdue(task);
  const displayStatus = overdue ? "überfällig" : task.status;
  li.dataset.status = displayStatus;
  li.dataset.id = String(task.id);
  li.innerHTML = `
    <div class="task-check">
      <input type="checkbox" data-select-id="${task.id}" ${selectedIds.has(task.id) ? "checked" : ""} />
    </div>
    <div class="task-info">
      <h4>${task.title}</h4>
      <p>${task.description}</p>
      <div class="task-meta">
        <span>${task.dueAt ? formatDateTime(task.dueAt) : (task.due || "")}</span>
        ${task.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </div>
    <div class="task-actions">
      <span class="status-pill" data-status="${displayStatus}">${displayStatus}</span>
      <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="ghost-btn ghost-btn--sm" data-action="toggle" data-id="${task.id}">${task.status === "abgeschlossen" ? "Rückgängig" : "Erledigt"}</button>
        <button class="ghost-btn ghost-btn--sm" data-action="details" data-id="${task.id}">Details</button>
        <button class="ghost-btn ghost-btn--sm" data-action="edit" data-id="${task.id}">Bearbeiten</button>
        ${state.role === 'lead' ? `<button class="ghost-btn ghost-btn--sm" data-action="delete" data-id="${task.id}">Löschen</button>` : ""}
      </div>
    </div>
  `;
  return li;
};

let currentFilter = "today";
let currentSearch = "";
let currentPriorityFilter = "";
let currentStatusFilter = "";
let currentSort = "created_desc";
const selectedIds = new Set();
let lastRenderedIds = [];

const renderTaskList = (filter = currentFilter) => {
  selectors.taskList.innerHTML = "";
  currentFilter = filter;
  let tasks = state.tasks.slice();

  if (filter === "today") {
    tasks = state.tasks.filter((task) => task.status !== "abgeschlossen");
  } else if (filter === "week") {
    tasks = state.tasks.filter((task) => task.status !== "abgeschlossen");
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    tasks = tasks.filter((t) =>
      (t.title + " " + t.description + " " + (t.tags || []).join(" ")).toLowerCase().includes(q)
    );
  }

  if (currentPriorityFilter) {
    tasks = tasks.filter((t) => t.priority === currentPriorityFilter);
  }
  if (currentStatusFilter) {
    tasks = tasks.filter((t) => t.status === currentStatusFilter);
  }

  const priorityOrder = { hoch: 3, mittel: 2, niedrig: 1 };
  if (currentSort === "created_desc") tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (currentSort === "created_asc") tasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  if (currentSort === "priority_desc") tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
  if (currentSort === "priority_asc") tasks.sort((a, b) => (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));
  if (currentSort === "status") tasks.sort((a, b) => String(a.status).localeCompare(String(b.status), 'de'));

  tasks.forEach((task) => selectors.taskList.appendChild(createTaskItem(task)));
  lastRenderedIds = tasks.map(t => t.id);

  // Update select-all checkbox state
  if (selectors.selectAll) {
    const idsOnPage = tasks.map((t) => t.id);
    const allSelected = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.has(id));
    selectors.selectAll.checked = allSelected;
    selectors.selectAll.indeterminate = !allSelected && idsOnPage.some((id) => selectedIds.has(id));
  }
  updateSelectionUI();
};

const renderTimeline = () => {
  selectors.updatesList.innerHTML = "";
  state.updates.forEach((update) => {
    const item = document.createElement("section");
    item.className = "timeline-item";
    item.innerHTML = `
      <h4>${update.title}</h4>
      <p>${update.content}</p>
      <div class="timeline-meta">${update.date}</div>
    `;
    selectors.updatesList.appendChild(item);
  });
};

const renderGuides = () => {
  selectors.guidesList.innerHTML = "";
  state.guides.forEach((guide) => {
    const card = document.createElement("article");
    card.className = "guide-card";
    card.innerHTML = `
      <h4>${guide.title}</h4>
      <p>${guide.description}</p>
      <button class="ghost-btn ghost-btn--sm">Öffnen</button>
    `;
    selectors.guidesList.appendChild(card);
  });
};

const renderEvents = () => {
  selectors.eventsList.innerHTML = "";
  state.events.forEach((event) => {
    const item = document.createElement("li");
    item.className = "event-item";
    item.innerHTML = `
      <div class="event-info">
        <h4>${event.title}</h4>
        <p>${event.description}</p>
      </div>
      <span class="event-chip">${event.date}</span>
    `;
    selectors.eventsList.appendChild(item);
  });
};

const renderTeam = () => {
  selectors.teamList.innerHTML = "";
  state.team.forEach((member) => {
    const item = document.createElement("li");
    item.className = "team-item";
    item.innerHTML = `
      <div class="team-member">
        <div class="team-avatar">${member.name.charAt(0)}</div>
        <div class="team-info">
          <h4>${member.name}</h4>
          <p>${member.role}</p>
        </div>
      </div>
      <div class="schedule">${member.shift}</div>
    `;
    selectors.teamList.appendChild(item);
  });
};

const handleTabs = () => {
  selectors.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectors.tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      renderTaskList(filter);
    });
  });
};

// Persistence
const STORAGE_KEY = "filial_taskcenter_state_v1";
const saveState = () => {
  try {
    // When API is active, persist only user-related locals; tasks are on server
    const payload = hasApi
      ? { currentUserName: state.currentUserName, role: state.role }
      : { tasks: state.tasks, currentUserName: state.currentUserName, role: state.role };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}
};

const loadState = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!hasApi && Array.isArray(parsed.tasks)) state.tasks = parsed.tasks;
      if (parsed.currentUserName) state.currentUserName = parsed.currentUserName;
      if (parsed.role) state.role = parsed.role;
    }
    if (hasApi) {
      const [tasksFromApi, updatesFromApi, guidesFromApi, eventsFromApi] = await Promise.all([
        apiGet("/tasks"),
        apiGet("/updates"),
        apiGet("/guides"),
        apiGet("/events"),
      ]);
      state.tasks = tasksFromApi || [];
      state.updates = updatesFromApi || state.updates;
      state.guides = guidesFromApi || state.guides;
      state.events = eventsFromApi || state.events;
    }
    // Ensure createdAt exists
    state.tasks.forEach((t) => {
      if (!t.createdAt) t.createdAt = Date.now();
    });
  } catch (e) {}
};

// Modals
const openModal = (el) => {
  if (!el) return;
  selectors.modalBackdrop.classList.remove("hidden");
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
};

const closeModal = (el) => {
  if (!el) return;
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
  // Close backdrop if all modals hidden
  if ([selectors.taskModal, selectors.detailsModal, selectors.employeeModal].every((m) => m.classList.contains("hidden"))) {
    selectors.modalBackdrop.classList.add("hidden");
  }
};

const closeAllModals = () => {
  [selectors.taskModal, selectors.detailsModal, selectors.employeeModal].forEach(closeModal);
  selectors.modalBackdrop.classList.add("hidden");
};

// Toasts
const showToast = (msg, type = "success") => {
  if (!selectors.toastContainer) return;
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  selectors.toastContainer.appendChild(t);
  setTimeout(() => t.remove(), 3000);
};

// CRUD helpers
const nextTaskId = () => (state.tasks.length ? Math.max(...state.tasks.map((t) => t.id)) + 1 : 1);

const upsertTaskFromForm = async () => {
  const idVal = selectors.taskId.value;
  const payload = {
    id: idVal ? Number(idVal) : nextTaskId(),
    title: selectors.taskTitle.value.trim(),
    description: selectors.taskDesc.value.trim(),
    priority: selectors.taskPriority.value,
    status: idVal ? (state.tasks.find((t) => t.id === Number(idVal))?.status || "offen") : "offen",
    dueAt: selectors.taskDue.value ? new Date(selectors.taskDue.value).toISOString() : undefined,
    tags: (selectors.taskTags.value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    createdAt: idVal ? (state.tasks.find((t) => t.id === Number(idVal))?.createdAt || Date.now()) : Date.now(),
  };
  if (!payload.title) return false;

  const existingIdx = state.tasks.findIndex((t) => t.id === payload.id);
  if (hasApi) {
    try {
      if (existingIdx >= 0) {
        const updated = await apiSend("PUT", `/tasks/${payload.id}`, payload);
        state.tasks[existingIdx] = updated;
        showToast("Aufgabe aktualisiert", "success");
      } else {
        const created = await apiSend("POST", "/tasks", payload);
        state.tasks.unshift(created);
        showToast("Aufgabe erstellt", "success");
      }
    } catch (_) {
      showToast("API nicht erreichbar – lokal gespeichert", "warning");
      if (existingIdx >= 0) state.tasks[existingIdx] = payload; else state.tasks.unshift(payload);
    }
  } else {
    if (existingIdx >= 0) {
      state.tasks[existingIdx] = payload;
      showToast("Aufgabe aktualisiert", "success");
    } else {
      state.tasks.unshift(payload);
      showToast("Aufgabe erstellt", "success");
    }
  }
  saveState();
  renderStats();
  renderTaskList();
  return true;
};

const fillTaskForm = (task) => {
  selectors.taskId.value = task?.id || "";
  selectors.taskTitle.value = task?.title || "";
  selectors.taskDesc.value = task?.description || "";
  selectors.taskPriority.value = task?.priority || "mittel";
  selectors.taskDue.value = task?.dueAt ? new Date(task.dueAt).toISOString().slice(0,16) : "";
  selectors.taskTags.value = (task?.tags || []).join(", ");
};

const openTaskCreate = () => {
  document.getElementById("task-modal-title").textContent = "Neue Aufgabe";
  fillTaskForm(null);
  openModal(selectors.taskModal);
};

const openTaskEdit = (id) => {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  document.getElementById("task-modal-title").textContent = "Aufgabe bearbeiten";
  fillTaskForm(task);
  openModal(selectors.taskModal);
};

const openTaskDetails = (id) => {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  selectors.detailsContent.innerHTML = `
    <h4 style="margin:0 0 8px">${task.title}</h4>
    <p style="margin:0 0 8px">${task.description}</p>
    <div class="task-meta" style="margin-bottom:12px">
      <span>${task.due}</span>
      <span class="tag">Priorität: ${task.priority}</span>
      ${task.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button class="ghost-btn ghost-btn--sm" data-d-details="toggle" data-id="${task.id}">${task.status === "abgeschlossen" ? "Rückgängig" : "Erledigt"}</button>
      <button class="ghost-btn ghost-btn--sm" data-d-details="edit" data-id="${task.id}">Bearbeiten</button>
      <button class="ghost-btn ghost-btn--sm" data-d-details="delete" data-id="${task.id}">Löschen</button>
    </div>
  `;
  openModal(selectors.detailsModal);
};

const deleteTask = async (id) => {
  if (hasApi) {
    try { await apiSend("DELETE", `/tasks/${id}`); } catch (_) { /* fallthrough to local */ }
  }
  state.tasks = state.tasks.filter((t) => t.id !== id);
  selectedIds.delete(id);
  saveState();
  renderStats();
  renderTaskList();
  showToast("Aufgabe gelöscht", "success");
};

const toggleTaskDone = async (id) => {
  const t = state.tasks.find((x) => x.id === id);
  if (!t) return;
  const newStatus = t.status === "abgeschlossen" ? "offen" : "abgeschlossen";
  if (hasApi) {
    try {
      const updated = await apiSend("PUT", `/tasks/${id}`, { status: newStatus });
      Object.assign(t, updated);
    } catch (_) {
      t.status = newStatus;
    }
  } else {
    t.status = newStatus;
  }
  saveState();
  renderStats();
  renderTaskList();
  showToast(newStatus === "abgeschlossen" ? "Aufgabe erledigt" : "Status zurückgesetzt", "success");
};

// Employee switch
const applyEmployeeName = (name) => {
  state.currentUserName = name;
  if (selectors.welcome) selectors.welcome.textContent = name;
  if (selectors.avatar) selectors.avatar.textContent = name.charAt(0).toUpperCase();
  saveState();
};

// Search debounce
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const init = async () => {
  await loadState();
  if (selectors.sidebarDate) {
    selectors.sidebarDate.textContent = formatGermanDate(new Date());
  }
  // Apply current user
  applyEmployeeName(state.currentUserName || "Anna");
  renderStats();
  renderTaskList();
  renderTimeline();
  renderGuides();
  renderEvents();
  renderTeam();
  handleTabs();

  // New task
  selectors.newTaskBtn?.addEventListener("click", openTaskCreate);
  // Role toggle
  const applyRole = () => {
    if (selectors.roleToggle) selectors.roleToggle.textContent = `Rolle: ${state.role === 'lead' ? 'Leitung' : 'Mitarbeiter'}`;
    // Hide bulk delete for staff
    if (selectors.bulkDelete) selectors.bulkDelete.style.display = state.role === 'lead' ? '' : 'none';
    renderTaskList(currentFilter);
  };
  applyRole();
  selectors.roleToggle?.addEventListener('click', () => {
    state.role = state.role === 'lead' ? 'staff' : 'lead';
    saveState();
    applyRole();
  });
  // Employee switcher
  selectors.employeeBtn?.addEventListener("click", () => {
    selectors.employeeName.value = state.currentUserName || "";
    openModal(selectors.employeeModal);
  });

  // Close modal handlers
  document.querySelectorAll("[data-close-modal]").forEach((btn) =>
    btn.addEventListener("click", closeAllModals)
  );
  selectors.modalBackdrop?.addEventListener("click", closeAllModals);

  // Task form submit
  selectors.taskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (upsertTaskFromForm()) {
      closeModal(selectors.taskModal);
      selectors.taskForm.reset();
    }
  });

  // Employee form submit
  selectors.employeeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = selectors.employeeName.value.trim();
    if (name) {
      applyEmployeeName(name);
      showToast("Mitarbeiter aktualisiert", "success");
      closeModal(selectors.employeeModal);
    }
  });

  // Task list actions (delegation)
  selectors.taskList?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "details") return openTaskDetails(id);
    if (action === "edit") return openTaskEdit(id);
    if (action === "delete") return deleteTask(id);
    if (action === "toggle") return toggleTaskDone(id);
  });

  // Selection checkboxes
  selectors.taskList?.addEventListener("change", (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-select-id]');
    if (!cb) return;
    const id = Number(cb.dataset.selectId);
    if (cb.checked) selectedIds.add(id);
    else selectedIds.delete(id);
    updateSelectionUI();
  });

  // Select all
  selectors.selectAll?.addEventListener("change", () => {
    // Apply to currently rendered list items
    const boxes = selectors.taskList.querySelectorAll('input[type="checkbox"][data-select-id]');
    boxes.forEach((box) => {
      box.checked = selectors.selectAll.checked;
      const id = Number(box.dataset.selectId);
      if (selectors.selectAll.checked) selectedIds.add(id);
      else selectedIds.delete(id);
    });
    selectors.selectAll.indeterminate = false;
    updateSelectionUI();
  });

  const updateSelectionUI = () => {
    try {
      // Update counter
      if (selectors.selectionCount) {
        const count = selectedIds.size;
        selectors.selectionCount.textContent = `${count} ausgewählt`;
      }
      // Row highlight based on selectedIds
      selectors.taskList?.querySelectorAll('.task-item').forEach((row) => {
        const id = Number(row.dataset.id);
        if (selectedIds.has(id)) row.classList.add('selected');
        else row.classList.remove('selected');
      });
      // Enable/disable toolbar actions
      const hasVisible = Array.isArray(lastRenderedIds) && lastRenderedIds.length > 0;
      const hasSelection = selectedIds.size > 0 && lastRenderedIds.some(id => selectedIds.has(id));
      if (selectors.bulkComplete) selectors.bulkComplete.disabled = !hasSelection;
      if (selectors.bulkDelete) selectors.bulkDelete.disabled = !hasSelection || (state.role !== 'lead');
      if (selectors.selectVisibleBtn) selectors.selectVisibleBtn.disabled = !hasVisible;
      if (selectors.invertSelectionBtn) selectors.invertSelectionBtn.disabled = !hasVisible;
      if (selectors.clearSelectionBtn) selectors.clearSelectionBtn.disabled = !hasSelection;
    } catch (_) {}
  };

  // Click on row toggles selection (excluding interactive elements)
  selectors.taskList?.addEventListener("click", (e) => {
    const isInteractive = e.target.closest('button, a, input, textarea, select, label');
    if (isInteractive) return;
    const row = e.target.closest('.task-item');
    if (!row) return;
    const id = Number(row.dataset.id);
    const checkbox = row.querySelector('input[type="checkbox"][data-select-id]');
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) selectedIds.add(id); else selectedIds.delete(id);
    updateSelectionUI();
  });

  // Selection utilities
  selectors.selectVisibleBtn?.addEventListener("click", () => {
    const boxes = selectors.taskList.querySelectorAll('input[type="checkbox"][data-select-id]');
    boxes.forEach((box) => {
      box.checked = true;
      selectedIds.add(Number(box.dataset.selectId));
    });
    updateSelectionUI();
  });
  selectors.invertSelectionBtn?.addEventListener("click", () => {
    const boxes = selectors.taskList.querySelectorAll('input[type="checkbox"][data-select-id]');
    boxes.forEach((box) => {
      const id = Number(box.dataset.selectId);
      const nowChecked = !box.checked;
      box.checked = nowChecked;
      if (nowChecked) selectedIds.add(id); else selectedIds.delete(id);
    });
    updateSelectionUI();
  });
  selectors.clearSelectionBtn?.addEventListener("click", () => {
    selectedIds.clear();
    const boxes = selectors.taskList.querySelectorAll('input[type="checkbox"][data-select-id]');
    boxes.forEach((box) => (box.checked = false));
    if (selectors.selectAll) {
      selectors.selectAll.checked = false;
      selectors.selectAll.indeterminate = false;
    }
    updateSelectionUI();
  });

  // Filters and sorting
  selectors.filterPriority?.addEventListener("change", (e) => {
    currentPriorityFilter = e.target.value;
    renderTaskList();
  });
  selectors.filterStatus?.addEventListener("change", (e) => {
    currentStatusFilter = e.target.value;
    renderTaskList();
  });
  selectors.sortSelect?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderTaskList();
  });

  // Bulk actions
  selectors.bulkComplete?.addEventListener("click", () => {
    if (!selectedIds.size) return;
    state.tasks.forEach((t) => {
      if (selectedIds.has(t.id)) t.status = "abgeschlossen";
    });
    saveState();
    renderStats();
    renderTaskList();
    showToast("Ausgewählte Aufgaben abgeschlossen", "success");
  });
  selectors.bulkDelete?.addEventListener("click", () => {
    if (!selectedIds.size) return;
    state.tasks = state.tasks.filter((t) => !selectedIds.has(t.id));
    selectedIds.clear();
    saveState();
    renderStats();
    renderTaskList();
    showToast("Ausgewählte Aufgaben gelöscht", "success");
  });

  // Export / Import
  selectors.exportBtn?.addEventListener("click", () => {
    const data = JSON.stringify({ tasks: state.tasks }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  selectors.importBtn?.addEventListener("click", () => selectors.importFile?.click());
  selectors.importFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      let items = Array.isArray(json) ? json : json.tasks;
      if (!Array.isArray(items)) throw new Error("Ungültiges Format");
      // Normalisieren und IDs zusammenführen
      const existingIds = new Set(state.tasks.map((t) => t.id));
      items.forEach((t) => {
        if (!t.id || existingIds.has(t.id)) t.id = nextTaskId();
        if (!t.createdAt) t.createdAt = Date.now();
        if (!t.priority) t.priority = "mittel";
        if (!t.status) t.status = "offen";
        if (!t.tags) t.tags = [];
      });
      state.tasks = [...items, ...state.tasks];
      saveState();
      renderStats();
      renderTaskList();
      showToast("Import abgeschlossen", "success");
    } catch (err) {
      showToast("Import fehlgeschlagen", "error");
    } finally {
      e.target.value = "";
    }
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (ev) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable;
    if (ev.key === "/" && !isTyping) {
      ev.preventDefault();
      selectors.globalSearch?.focus();
    }
    if ((ev.key === "n" || ev.key === "N") && !isTyping) {
      ev.preventDefault();
      openTaskCreate();
    }
  });

  // Details modal action delegation
  selectors.detailsModal?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-d-details]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.dDetails;
    if (action === "edit") {
      closeModal(selectors.detailsModal);
      return openTaskEdit(id);
    }
    if (action === "delete") {
      closeModal(selectors.detailsModal);
      return deleteTask(id);
    }
    if (action === "toggle") return toggleTaskDone(id);
  });

  // Search
  const onSearch = debounce((val) => {
    currentSearch = val;
    renderTaskList();
  }, 200);
  selectors.globalSearch?.addEventListener("input", (e) => onSearch(e.target.value));

  // Router: navigate to fullscreen pages
  const routes = {
    '#updates/all': {
      title: 'Zentrale Updates',
      render: (q = '') => {
        const items = state.updates.filter(u => (u.title + ' ' + u.content).toLowerCase().includes(q.toLowerCase()));
        return `<div class="page-list">${items.map(u => `
          <div class="timeline-item" style="padding-left:0">
            <h4 style=\"margin:0 0 4px\">${u.title}</h4>
            <p style=\"margin:0 0 6px\">${u.content}</p>
            <div class=\"timeline-meta\">${u.date}</div>
          </div>
        `).join('')}</div>`;
      },
    },
    '#guides/all': {
      title: 'Anleitungen & Systeme',
      render: (q = '') => {
        const items = state.guides.filter(g => (g.title + ' ' + g.description).toLowerCase().includes(q.toLowerCase()));
        return `<div class="page-list">${items.map(g => `
          <div class=\"guide-card\">
            <h4>${g.title}</h4>
            <p>${g.description}</p>
            <button class=\"ghost-btn ghost-btn--sm\">Öffnen</button>
          </div>
        `).join('')}</div>`;
      },
    },
    '#events/all': {
      title: 'Aktionstage & Kampagnen',
      render: (q = '') => {
        const items = state.events.filter(e => (e.title + ' ' + e.description + ' ' + e.date).toLowerCase().includes(q.toLowerCase()));
        return `<div class="page-list">${items.map(e => `
          <div class=\"event-item\">
            <div class=\"event-info\">
              <h4>${e.title}</h4>
              <p>${e.description}</p>
            </div>
            <div class=\"event-chip\">${e.date}</div>
          </div>
        `).join('')}</div>`;
      },
    },
  };

  let currentRoute = '';
  let currentPageQuery = '';

  const showPage = (hash) => {
    const route = routes[hash];
    if (!route) return hidePage();
    currentRoute = hash;
    selectors.pageTitle.textContent = route.title;
    selectors.pageContent.innerHTML = route.render(currentPageQuery);
    selectors.pageView.classList.remove('hidden');
  };

  const hidePage = () => {
    currentRoute = '';
    selectors.pageView.classList.add('hidden');
  };

  const handleHash = () => {
    if (routes[location.hash]) {
      currentPageQuery = '';
      if (selectors.pageSearch) selectors.pageSearch.value = '';
      showPage(location.hash);
    } else {
      hidePage();
    }
  };

  window.addEventListener('hashchange', handleHash);
  selectors.pageBack?.addEventListener('click', () => {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    hidePage();
  });
  selectors.pageSearch?.addEventListener('input', (e) => {
    currentPageQuery = e.target.value || '';
    if (currentRoute && routes[currentRoute]) {
      selectors.pageContent.innerHTML = routes[currentRoute].render(currentPageQuery);
    }
  });

  // Buttons navigate to hash routes
  document.getElementById('updates-all-btn')?.addEventListener('click', () => { location.hash = '#updates/all'; });
  document.getElementById('guides-lib-btn')?.addEventListener('click', () => { location.hash = '#guides/all'; });
  document.getElementById('events-cal-btn')?.addEventListener('click', () => { location.hash = '#events/all'; });

  // Initial route check
  handleHash();

  // Guides: open individual guide
  selectors.guidesList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const card = btn.closest('.guide-card');
    const title = card?.querySelector('h4')?.textContent || 'Anleitung';
    showToast(`${title} geöffnet`, 'success');
  });

  // Quick actions in Ressourcen
  document.querySelector('#ressourcen .quick-actions')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const label = btn.textContent.trim();
    showToast(`${label} gestartet`, 'success');
  });
};

window.addEventListener("DOMContentLoaded", init);
