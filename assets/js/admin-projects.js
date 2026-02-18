// ==================== PROJECTS PANEL ====================
function loadAdminProjectsPanel() {
    const projectStages = ['Discovery', 'Design', 'Development', 'Review', 'Delivery', 'Complete'];
    document.getElementById('adminProjectsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📂 Project Tracker</h2>
<p class="panel-subtitle">Track project progress, timers, and payments</p>
</div>

        <!-- Stats Overview -->
<div class="stats-grid">
<div class="stat-card">
<div class="stat-label">Active Projects</div>
<div class="stat-value">${projects.filter(p => p.stage !== 'Complete').length}</div>
</div>
<div class="stat-card">
<div class="stat-label">Completed</div>
<div class="stat-value" style="color: #2a9d8f;">${projects.filter(p => p.stage === 'Complete').length}</div>
</div>
<div class="stat-card">
<div class="stat-label">Total Value</div>
<div class="stat-value">$${projects.reduce((s, p) => s + (p.totalAmount || 0), 0).toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="stat-label">This Month</div>
<div class="stat-value">${projects.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length}</div>
</div>
</div>

<div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
<button class="btn-admin primary" onclick="showAddProjectModal()">+ New Project</button>
</div>
        ${projects.length === 0 ? '<div class="form-section" style="text-align: center; padding: 60px;"><p class="text-dim">No projects yet. Create your first project!</p></div>' : projects.map(project => {
            const client = crmData.clients?.find(c => c.id === project.clientId) || clients.find(c => c.id === project.clientId) || { name: 'Unknown' };
            const stageIdx = projectStages.indexOf(project.stage || 'Discovery');
            const progress = Math.round(((stageIdx + 1) / projectStages.length) * 100);
            const timeTracked = project.timeTracked || 0;
            const hours = Math.floor(timeTracked / 3600);
            const mins = Math.floor((timeTracked % 3600) / 60);
            const pkg = servicePackages.find(p => p.id === project.packageId) || { name: project.type || 'Custom' };
            const plan = paymentPlans[project.paymentPlan] || { name: 'Full Payment' };

            return `
<div class="order-card" style="position: relative;">
                    <!-- Timer Badge -->
<div style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px;">
<span style="font-size: 12px; opacity: 0.7;">⏱️</span>
<span id="timer-${project.id}" style="font-family: monospace; font-size: 14px;">${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00</span>
<button class="timer-btn ${project.timerRunning ? 'active' : ''}" onclick="toggleProjectTimer(${project.id})" style="background: ${project.timerRunning ? 'var(--red)' : 'rgba(255,255,255,0.2)'}; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; color: #fff; font-size: 12px;">
                            ${project.timerRunning ? '⏸' : '▶'}
</button>
</div>

<div class="order-header">
<div>
<div class="order-title">${project.name}</div>
<div class="order-client">${client.name}</div>
<div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
<span class="tag">${pkg.name}</span>
                                ${project.totalAmount ? `<span class="tag" style="background: rgba(42, 157, 143, 0.2); color: #2a9d8f;">$${project.totalAmount.toLocaleString()}</span>` : ''}
<span class="tag" style="background: rgba(230, 57, 70, 0.2);">${plan.name}</span>
</div>
</div>
<span class="order-status ${project.stage === 'Complete' ? 'approved' : 'in_progress'}">${project.stage || 'Discovery'}</span>
</div>
<div class="project-stages">
                        ${projectStages.map((stage, i) => `<div class="project-stage ${i <= stageIdx ? (i < stageIdx ? 'completed' : 'active') : ''}">${stage}</div>`).join('')}
</div>
<div class="mb-16">
<div class="flex-between mb-8">
<span style="font-size: 13px; color: rgba(255,255,255,0.5);">Progress</span>
<span style="font-size: 13px; font-weight: 600;">${progress}%</span>
</div>
<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
</div>

                    <!-- Payment Progress -->
                    ${project.paymentPlan && project.paymentPlan !== 'full' ? `
<div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
<div class="flex-between mb-8">
<span style="font-size: 12px; opacity: 0.7;">💳 Payment Progress</span>
<span style="font-size: 12px;">${project.paidInstallments || 0}/${paymentPlans[project.paymentPlan]?.installments || 3} paid</span>
</div>
<div style="display: flex; gap: 4px;">
                            ${paymentPlans[project.paymentPlan]?.schedule?.map((pct, i) => `
<div style="flex: ${pct}; height: 6px; background: ${i < (project.paidInstallments || 0) ? '#2a9d8f' : 'rgba(255,255,255,0.1)'}; border-radius: 3px;"></div>
                            `).join('') || ''}
</div>
</div>
                    ` : ''}

<div class="flex-gap-12 flex-wrap">
<button class="btn-admin secondary" onclick="editProject(${project.id})">Edit</button>
<button class="btn-admin secondary" onclick="viewProjectDetails(${project.id})">📊 Details</button>
<button class="btn-admin primary" onclick="advanceProject(${project.id})">Advance Stage →</button>
</div>
</div>
            `;
        }).join('')}
    `;

    // Start running timers
    projects.filter(p => p.timerRunning).forEach(p => startTimerInterval(p.id));
}

function showAddProjectModal() {
    const allClients = [...(crmData.clients || []), ...clients];
    const uniqueClients = allClients.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'projectModal';
    modal.innerHTML = `
<div class="modal max-w-700">
<div class="modal-header"><h3 class="modal-title">New Project</h3><button class="modal-close" onclick="document.getElementById('projectModal').remove()">×</button></div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
<div class="form-row">
<div class="form-group">
<label class="form-label">Project Name *</label>
<input type="text" id="projectName" class="form-input" placeholder="Brand Identity Package">
</div>
<div class="form-group">
<label class="form-label">Client *</label>
<select id="projectClient" class="form-select">
<option value="">Select client...</option>
                            ${uniqueClients.map(c => `<option value="${c.id}">${c.name} ${c.company ? '- ' + c.company : ''}</option>`).join('')}
</select>
</div>
</div>

                <!-- Package Selection -->
<div class="form-section mt-16">
<div class="form-section-title">📦 Select Package</div>
<div class="form-group">
<label class="form-label">Service Package</label>
<select id="projectPackage" class="form-select" onchange="updateProjectPrice()">
<option value="">-- Select Package --</option>
                            ${servicePackages.map(pkg => `
<option value="${pkg.id}" data-price="${pkg.price}" data-turnaround="${pkg.turnaround}">
                                    ${pkg.name} - $${pkg.price.toLocaleString()} (${pkg.turnaround})
</option>
                            `).join('')}
<option value="custom">Custom / Individual Services</option>
</select>
</div>
<div id="packageInfo" style="display: none; padding: 12px; background: rgba(42, 157, 143, 0.1); border-radius: 8px; margin-bottom: 16px;">
<div class="flex-between">
<div>
<strong id="selectedPackageName"></strong>
<p id="selectedPackageDesc" style="font-size: 13px; opacity: 0.7; margin-top: 4px;"></p>
</div>
<div class="text-right">
<div style="font-size: 24px; font-weight: 600; color: #2a9d8f;">$<span id="selectedPackagePrice">0</span></div>
<div style="font-size: 12px; opacity: 0.7;" id="selectedPackageTurnaround"></div>
</div>
</div>
</div>
</div>

                <!-- Individual Services (shown when custom selected) -->
<div id="individualServicesSection" class="form-section hidden">
<div class="form-section-title">🛠️ Individual Services</div>
<p style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px;">Select individual services to add to this project:</p>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${individualServices.map(service => `
<label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
<input type="checkbox" class="service-checkbox" data-id="${service.id}" data-price="${service.price}" data-name="${service.name}" onchange="updateProjectPrice()">
<div class="flex-1">
<div class="fs-14">${service.name}</div>
<div style="font-size: 12px; opacity: 0.7;">${service.category}</div>
</div>
<span style="font-weight: 600; color: #2a9d8f;">$${service.price}</span>
</label>
                        `).join('')}
</div>
</div>

                <!-- Custom Amount Override -->
<div class="form-group mt-16">
<label class="form-label">Custom Price Override (optional)</label>
<input type="number" id="projectCustomPrice" class="form-input" placeholder="Leave blank to use package/service price" onchange="updateProjectPrice()">
</div>

                <!-- Payment Plan Selection -->
<div class="form-section mt-16">
<div class="form-section-title">💳 Payment Plan</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                        ${Object.entries(paymentPlans).map(([key, plan]) => `
<label style="display: block; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;" id="plan-${key}" onclick="selectPaymentPlan('${key}')">
<input type="radio" name="paymentPlan" value="${key}" class="hidden" ${key === 'standard' ? 'checked' : ''}>
<div style="font-weight: 600; margin-bottom: 4px;">${plan.name}</div>
                                ${plan.discount > 0 ? `<div style="font-size: 12px; color: #2a9d8f;">Save ${plan.discount}%</div>` : ''}
<div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">${plan.schedule.join('% → ')}%</div>
                                ${plan.triggers ? `<div style="font-size: 11px; opacity: 0.5; margin-top: 4px;">${plan.triggers.join(' → ')}</div>` : ''}
</label>
                        `).join('')}
</div>
</div>

                <!-- Total Summary -->
<div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, rgba(230, 57, 70, 0.1), rgba(29, 53, 87, 0.1)); border-radius: 12px; border: 1px solid rgba(230, 57, 70, 0.3);">
<div class="flex-between">
<div>
<div style="font-size: 14px; opacity: 0.7;">Project Total</div>
<div style="font-size: 11px; opacity: 0.5;" id="paymentBreakdown">50% deposit → 25% on approval → 25% before download</div>
</div>
<div class="text-right">
<div style="font-size: 32px; font-weight: 700; color: var(--red);">$<span id="projectTotalAmount">0</span></div>
<div style="font-size: 12px; opacity: 0.7;" id="discountNote"></div>
</div>
</div>
</div>

<div class="form-row mt-16">
<div class="form-group">
<label class="form-label">Start Date</label>
<input type="date" id="projectStart" class="form-input" value="${new Date().toISOString().split('T')[0]}">
</div>
<div class="form-group">
<label class="form-label">Due Date</label>
<input type="date" id="projectDue" class="form-input">
</div>
</div>
<div class="form-group">
<label class="form-label">Notes</label>
<textarea id="projectNotes" class="form-textarea" placeholder="Project details, special requirements..."></textarea>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('projectModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="saveProject()">Create Project</button>
</div>
</div>
    `;
    document.body.appendChild(modal);

    // Initialize payment plan selection
    selectPaymentPlan('standard');
}

function selectPaymentPlan(planKey) {
    // Update visual selection
    Object.keys(paymentPlans).forEach(key => {
        const el = document.getElementById('plan-' + key);
        if (el) {
            el.style.borderColor = key === planKey ? 'var(--red)' : 'transparent';
            el.style.background = key === planKey ? 'rgba(230, 57, 70, 0.15)' : 'rgba(255,255,255,0.05)';
            el.querySelector('input').checked = key === planKey;
        }
    });

    // Update breakdown text
    const plan = paymentPlans[planKey];
    const breakdown = document.getElementById('paymentBreakdown');
    if (breakdown && plan.triggers) {
        breakdown.textContent = plan.schedule.map((pct, i) => `${pct}% ${plan.triggers[i]}`).join(' → ');
    } else if (breakdown) {
        breakdown.textContent = plan.name;
    }

    updateProjectPrice();
}

function updateProjectPrice() {
    const packageSelect = document.getElementById('projectPackage');
    const customPrice = document.getElementById('projectCustomPrice');
    const totalEl = document.getElementById('projectTotalAmount');
    const packageInfo = document.getElementById('packageInfo');
    const servicesSection = document.getElementById('individualServicesSection');
    const discountNote = document.getElementById('discountNote');

    let total = 0;

    if (packageSelect.value === 'custom') {
        // Show individual services
        servicesSection.style.display = 'block';
        packageInfo.style.display = 'none';

        // Calculate from selected services
        document.querySelectorAll('.service-checkbox:checked').forEach(cb => {
            total += parseFloat(cb.dataset.price) || 0;
        });
    } else if (packageSelect.value) {
        // Show package info
        servicesSection.style.display = 'none';
        packageInfo.style.display = 'block';

        const pkg = servicePackages.find(p => p.id === packageSelect.value);
        if (pkg) {
            document.getElementById('selectedPackageName').textContent = pkg.name;
            document.getElementById('selectedPackageDesc').textContent = pkg.desc;
            document.getElementById('selectedPackagePrice').textContent = pkg.price.toLocaleString();
            document.getElementById('selectedPackageTurnaround').textContent = pkg.turnaround;
            total = pkg.price;
        }
    } else {
        servicesSection.style.display = 'none';
        packageInfo.style.display = 'none';
    }

    // Override with custom price if provided
    if (customPrice.value) {
        total = parseFloat(customPrice.value);
    }

    // Apply discount based on payment plan
    const selectedPlan = document.querySelector('input[name="paymentPlan"]:checked')?.value;
    const plan = paymentPlans[selectedPlan];
    if (plan && plan.discount > 0) {
        const discount = total * (plan.discount / 100);
        total = total - discount;
        discountNote.textContent = `${plan.discount}% discount applied`;
    } else {
        discountNote.textContent = '';
    }

    totalEl.textContent = total.toLocaleString();
}

function saveProject() {
    const packageSelect = document.getElementById('projectPackage');
    const pkg = servicePackages.find(p => p.id === packageSelect.value);
    const selectedPlan = document.querySelector('input[name="paymentPlan"]:checked')?.value || 'standard';
    const customPrice = parseFloat(document.getElementById('projectCustomPrice').value);

    // Get selected services if custom
    const selectedServices = [];
    if (packageSelect.value === 'custom') {
        document.querySelectorAll('.service-checkbox:checked').forEach(cb => {
            selectedServices.push({
                id: cb.dataset.id,
                name: cb.dataset.name,
                price: parseFloat(cb.dataset.price)
            });
        });
    }

    // Calculate total
    let totalAmount = 0;
    if (customPrice) {
        totalAmount = customPrice;
    } else if (pkg) {
        totalAmount = pkg.price;
    } else {
        totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
    }

    // Apply discount
    const plan = paymentPlans[selectedPlan];
    if (plan && plan.discount > 0) {
        totalAmount = totalAmount - (totalAmount * (plan.discount / 100));
    }

    const project = {
        id: Date.now(),
        name: document.getElementById('projectName').value,
        clientId: parseInt(document.getElementById('projectClient').value) || null,
        packageId: packageSelect.value !== 'custom' ? packageSelect.value : null,
        package: pkg ? pkg.name : 'Custom',
        type: pkg ? pkg.category : 'Custom',
        services: selectedServices,
        paymentPlan: selectedPlan,
        totalAmount: totalAmount,
        paidInstallments: 0,
        stage: 'Discovery',
        startDate: document.getElementById('projectStart').value,
        dueDate: document.getElementById('projectDue').value,
        notes: document.getElementById('projectNotes').value,
        timeTracked: 0,
        timerRunning: false,
        timerStartedAt: null,
        activityLog: [{
            action: 'Project created',
            timestamp: new Date().toISOString(),
            stage: 'Discovery'
        }],
        createdAt: new Date().toISOString()
    };
    projects.push(project);
    saveProjects();
    document.getElementById('projectModal').remove();
    loadAdminProjectsPanel();
    alert('Project created successfully! Total: $' + totalAmount.toLocaleString());
}

// Timer functionality
let timerIntervals = {};

function toggleProjectTimer(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.timerRunning) {
        // Stop timer
        stopProjectTimer(projectId);
    } else {
        // Start timer
        startProjectTimer(projectId);
    }
}

function startProjectTimer(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    project.timerRunning = true;
    project.timerStartedAt = Date.now();
    saveProjects();

    startTimerInterval(projectId);
    loadAdminProjectsPanel();
}

function stopProjectTimer(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Calculate elapsed time
    if (project.timerStartedAt) {
        const elapsed = Math.floor((Date.now() - project.timerStartedAt) / 1000);
        project.timeTracked = (project.timeTracked || 0) + elapsed;
    }

    project.timerRunning = false;
    project.timerStartedAt = null;

    // Clear interval
    if (timerIntervals[projectId]) {
        clearInterval(timerIntervals[projectId]);
        delete timerIntervals[projectId];
    }

    // Log activity
    project.activityLog = project.activityLog || [];
    project.activityLog.push({
        action: 'Timer stopped',
        timestamp: new Date().toISOString(),
        duration: project.timeTracked
    });

    saveProjects();
    loadAdminProjectsPanel();
}

function startTimerInterval(projectId) {
    if (timerIntervals[projectId]) return;

    timerIntervals[projectId] = setInterval(() => {
        const project = projects.find(p => p.id === projectId);
        if (!project || !project.timerRunning) {
            clearInterval(timerIntervals[projectId]);
            delete timerIntervals[projectId];
            return;
        }

        const elapsed = project.timerStartedAt ? Math.floor((Date.now() - project.timerStartedAt) / 1000) : 0;
        const totalSeconds = (project.timeTracked || 0) + elapsed;
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const timerEl = document.getElementById('timer-' + projectId);
        if (timerEl) {
            timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
    }, 1000);
}

function viewProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const client = crmData.clients?.find(c => c.id === project.clientId) || clients.find(c => c.id === project.clientId) || { name: 'Unknown' };
    const pkg = servicePackages.find(p => p.id === project.packageId) || { name: project.package || 'Custom' };
    const plan = paymentPlans[project.paymentPlan] || { name: 'Full Payment', schedule: [100] };
    const timeTracked = project.timeTracked || 0;
    const hours = Math.floor(timeTracked / 3600);
    const mins = Math.floor((timeTracked % 3600) / 60);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'projectDetailsModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 800px;">
<div class="modal-header" style="background: var(--red);">
<h3 class="modal-title text-white">📊 ${project.name}</h3>
<button class="modal-close" onclick="document.getElementById('projectDetailsModal').remove()" class="text-white">×</button>
</div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                <!-- Overview Cards -->
<div class="stats-grid mb-24">
<div class="stat-card">
<div class="stat-label">Client</div>
<div class="stat-value" style="font-size: 18px;">${client.name}</div>
</div>
<div class="stat-card">
<div class="stat-label">Package</div>
<div class="stat-value" style="font-size: 18px;">${pkg.name}</div>
</div>
<div class="stat-card">
<div class="stat-label">Value</div>
<div class="stat-value" style="color: #2a9d8f;">$${(project.totalAmount || 0).toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="stat-label">Time Tracked</div>
<div class="stat-value" style="font-family: monospace;">${hours}h ${mins}m</div>
</div>
</div>

                <!-- Project Timeline -->
<div class="form-section">
<div class="form-section-title">📅 Timeline</div>
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
<div style="padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
<div style="font-size: 12px; opacity: 0.6;">Start Date</div>
<div style="font-size: 16px;">${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</div>
</div>
<div style="padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
<div style="font-size: 12px; opacity: 0.6;">Due Date</div>
<div style="font-size: 16px;">${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}</div>
</div>
<div style="padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
<div style="font-size: 12px; opacity: 0.6;">Current Stage</div>
<div style="font-size: 16px;">${project.stage || 'Discovery'}</div>
</div>
</div>
</div>

                <!-- Payment Progress -->
<div class="form-section">
<div class="form-section-title">💳 Payment Schedule (${plan.name})</div>
<div class="flex-gap-12 flex-wrap">
                        ${plan.schedule.map((pct, i) => {
                            const isPaid = i < (project.paidInstallments || 0);
                            const amount = Math.round((project.totalAmount || 0) * pct / 100);
                            return `
<div style="flex: 1; min-width: 150px; padding: 16px; background: ${isPaid ? 'rgba(42, 157, 143, 0.2)' : 'rgba(255,255,255,0.05)'}; border-radius: 12px; border: 2px solid ${isPaid ? '#2a9d8f' : 'transparent'};">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
<span style="font-size: 12px; opacity: 0.7;">${plan.triggers?.[i] || `Payment ${i + 1}`}</span>
                                        ${isPaid ? '<span style="color: #2a9d8f;">✓</span>' : ''}
</div>
<div style="font-size: 20px; font-weight: 600;">$${amount.toLocaleString()}</div>
<div style="font-size: 12px; opacity: 0.5;">${pct}%</div>
</div>
                            `;
                        }).join('')}
</div>
                    ${project.paidInstallments < plan.schedule.length ? `
<button class="btn-admin primary mt-16" onclick="recordProjectPayment(${project.id})">
                            💳 Record Next Payment ($${Math.round((project.totalAmount || 0) * plan.schedule[project.paidInstallments || 0] / 100).toLocaleString()})
</button>
                    ` : '<p style="color: #2a9d8f; margin-top: 16px;">✓ All payments received!</p>'}
</div>

                <!-- Services Included -->
                ${project.services && project.services.length > 0 ? `
<div class="form-section">
<div class="form-section-title">🛠️ Services Included</div>
<div class="flex-wrap">
                        ${project.services.map(s => `<span class="tag">${s.name} - $${s.price}</span>`).join('')}
</div>
</div>
                ` : ''}

                <!-- Activity Log -->
<div class="form-section">
<div class="form-section-title">📋 Activity Log</div>
<div style="max-height: 200px; overflow-y: auto;">
                        ${(project.activityLog || []).slice().reverse().map(log => `
<div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;">
<span>${log.action}</span>
<span style="font-size: 12px; opacity: 0.5;">${new Date(log.timestamp).toLocaleString()}</span>
</div>
                        `).join('') || '<p style="opacity: 0.5;">No activity logged yet</p>'}
</div>
</div>

                <!-- Notes -->
                ${project.notes ? `
<div class="form-section">
<div class="form-section-title">📝 Notes</div>
<p style="line-height: 1.7;">${project.notes}</p>
</div>
                ` : ''}
</div>
<div class="modal-footer">
<button class="btn-admin secondary" onclick="document.getElementById('projectDetailsModal').remove()">Close</button>
<button class="btn-admin secondary" onclick="createInvoiceForProject(${project.id})">📄 Create Invoice</button>
<button class="btn-admin primary" onclick="editProject(${project.id}); document.getElementById('projectDetailsModal').remove();">Edit Project</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function recordProjectPayment(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const plan = paymentPlans[project.paymentPlan] || { schedule: [100] };
    const installmentIndex = project.paidInstallments || 0;
    const amount = Math.round((project.totalAmount || 0) * plan.schedule[installmentIndex] / 100);

    const client = crmData.clients?.find(c => c.id === project.clientId) || { name: 'Unknown' };

    // Record the payment
    const payment = {
        id: Date.now(),
        clientId: project.clientId,
        clientName: client.name,
        projectId: project.id,
        projectName: project.name,
        amount: amount,
        type: plan.triggers?.[installmentIndex] || 'installment',
        date: new Date().toISOString().split('T')[0],
        notes: `${plan.triggers?.[installmentIndex] || 'Installment'} payment for ${project.name}`,
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    payments.push(payment);
    savePayments();

    // Update project
    project.paidInstallments = (project.paidInstallments || 0) + 1;
    project.activityLog = project.activityLog || [];
    project.activityLog.push({
        action: `Payment received: $${amount.toLocaleString()} (${plan.triggers?.[installmentIndex] || 'installment'})`,
        timestamp: new Date().toISOString()
    });
    saveProjects();

    // Close modal and refresh
    if (document.getElementById('projectDetailsModal')) {
        document.getElementById('projectDetailsModal').remove();
    }
    loadAdminProjectsPanel();
    alert(`Payment of $${amount.toLocaleString()} recorded successfully!`);
}

function createInvoiceForProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Close details modal
    if (document.getElementById('projectDetailsModal')) {
        document.getElementById('projectDetailsModal').remove();
    }

    // Open invoice panel and show create modal
    showAdminPanel('invoices');
    setTimeout(() => {
        showCreateInvoiceModal();
        // Pre-fill with project info
        setTimeout(() => {
            const clientSelect = document.getElementById('invoiceClient');
            if (clientSelect && project.clientId) {
                clientSelect.value = project.clientId;
                loadInvoiceClientProjects(project.clientId);
                setTimeout(() => {
                    const projectSelect = document.getElementById('invoiceProject');
                    if (projectSelect) {
                        projectSelect.value = project.id;
                        populateInvoiceFromProject(project.id);
                    }
                }, 100);
            }
        }, 100);
    }, 100);
}

function advanceProject(id) {
    const stages = ['Discovery', 'Design', 'Development', 'Review', 'Delivery', 'Complete'];
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const currentIdx = stages.indexOf(project.stage || 'Discovery');
    if (currentIdx < stages.length - 1) {
        const newStage = stages[currentIdx + 1];
        project.stage = newStage;

        // Log activity
        project.activityLog = project.activityLog || [];
        project.activityLog.push({
            action: `Stage advanced to ${newStage}`,
            timestamp: new Date().toISOString(),
            stage: newStage
        });

        // Check for auto-pay triggers
        const plan = paymentPlans[project.paymentPlan];
        if (plan && plan.triggers) {
            // Approval trigger
            if (newStage === 'Review' && plan.triggers.includes('approval') && (project.paidInstallments || 0) === 1) {
                alert(`Payment reminder: ${plan.name} - Next payment (25%) is due on approval.`);
            }
            // Delivery trigger
            if (newStage === 'Delivery' && plan.triggers.includes('delivery') && (project.paidInstallments || 0) === 2) {
                alert(`Payment reminder: ${plan.name} - Final payment (25%) is due before download.`);
            }
        }

        saveProjects();
        loadAdminProjectsPanel();
    } else {
        alert('Project is already complete!');
    }
}

function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const stages = ['Discovery', 'Design', 'Development', 'Review', 'Delivery', 'Complete'];
    const allClients = [...(crmData.clients || []), ...clients];
    const uniqueClients = allClients.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'projectModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 600px;">
<div class="modal-header"><h3 class="modal-title">Edit Project</h3><button class="modal-close" onclick="document.getElementById('projectModal').remove()">×</button></div>
<div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
<div class="form-group">
<label class="form-label">Project Name</label>
<input type="text" id="projectName" class="form-input" value="${project.name}">
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Client</label>
<select id="projectClient" class="form-select">
<option value="">Select client...</option>
                            ${uniqueClients.map(c => `<option value="${c.id}" ${c.id == project.clientId ? 'selected' : ''}>${c.name}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Stage</label>
<select id="projectStage" class="form-select">
                            ${stages.map(s => `<option value="${s}" ${project.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
</select>
</div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Package</label>
<select id="projectPackageEdit" class="form-select">
<option value="">Custom</option>
                            ${servicePackages.map(pkg => `<option value="${pkg.id}" ${pkg.id === project.packageId ? 'selected' : ''}>${pkg.name} - $${pkg.price}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Total Amount</label>
<input type="number" id="projectAmount" class="form-input" value="${project.totalAmount || 0}" step="0.01">
</div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Payment Plan</label>
<select id="projectPlanEdit" class="form-select">
                            ${Object.entries(paymentPlans).map(([key, plan]) => `<option value="${key}" ${key === project.paymentPlan ? 'selected' : ''}>${plan.name}</option>`).join('')}
</select>
</div>
<div class="form-group">
<label class="form-label">Payments Made</label>
<select id="projectPaidInstallments" class="form-select">
<option value="0" ${(project.paidInstallments || 0) === 0 ? 'selected' : ''}>0 payments</option>
<option value="1" ${project.paidInstallments === 1 ? 'selected' : ''}>1 payment</option>
<option value="2" ${project.paidInstallments === 2 ? 'selected' : ''}>2 payments</option>
<option value="3" ${project.paidInstallments === 3 ? 'selected' : ''}>3 payments</option>
</select>
</div>
</div>
<div class="form-row">
<div class="form-group">
<label class="form-label">Start Date</label>
<input type="date" id="projectStart" class="form-input" value="${project.startDate || ''}">
</div>
<div class="form-group">
<label class="form-label">Due Date</label>
<input type="date" id="projectDue" class="form-input" value="${project.dueDate || ''}">
</div>
</div>
<div class="form-group">
<label class="form-label">Time Tracked (seconds)</label>
<input type="number" id="projectTimeTracked" class="form-input" value="${project.timeTracked || 0}">
<p style="font-size: 11px; opacity: 0.5; margin-top: 4px;">Current: ${Math.floor((project.timeTracked || 0) / 3600)}h ${Math.floor(((project.timeTracked || 0) % 3600) / 60)}m</p>
</div>
<div class="form-group">
<label class="form-label">Notes</label>
<textarea id="projectNotes" class="form-textarea" rows="3">${project.notes || ''}</textarea>
</div>
</div>
<div class="modal-footer">
<button class="btn-admin danger" onclick="deleteProject(${id})">Delete</button>
<button class="btn-admin secondary" onclick="document.getElementById('projectModal').remove()">Cancel</button>
<button class="btn-admin primary" onclick="updateProject(${id})">Update</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function updateProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const oldStage = project.stage;
    const newStage = document.getElementById('projectStage').value;

    project.name = document.getElementById('projectName').value;
    project.clientId = parseInt(document.getElementById('projectClient').value) || null;
    project.stage = newStage;
    project.packageId = document.getElementById('projectPackageEdit').value || null;
    project.package = servicePackages.find(p => p.id === project.packageId)?.name || 'Custom';
    project.totalAmount = parseFloat(document.getElementById('projectAmount').value) || 0;
    project.paymentPlan = document.getElementById('projectPlanEdit').value;
    project.paidInstallments = parseInt(document.getElementById('projectPaidInstallments').value) || 0;
    project.startDate = document.getElementById('projectStart').value;
    project.dueDate = document.getElementById('projectDue').value;
    project.timeTracked = parseInt(document.getElementById('projectTimeTracked').value) || 0;
    project.notes = document.getElementById('projectNotes').value;

    // Log stage change
    if (oldStage !== newStage) {
        project.activityLog = project.activityLog || [];
        project.activityLog.push({
            action: `Stage changed from ${oldStage} to ${newStage}`,
            timestamp: new Date().toISOString(),
            stage: newStage
        });
    }

    saveProjects();
    document.getElementById('projectModal').remove();
    loadAdminProjectsPanel();
}

function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    projects = projects.filter(p => p.id !== id);
    saveProjects();
    document.getElementById('projectModal').remove();
    loadAdminProjectsPanel();
}

// ==================== PROOFS PANEL ====================

// Proof Categories and Types with Sizes
const PROOF_CATEGORIES = {
    print: {
        name: 'Print Materials',
        icon: '🖨️',
        types: [
            { id: 'business_card_front', name: 'Business Card - Front', size: '3.5" x 2"', category: 'print' },
            { id: 'business_card_back', name: 'Business Card - Back', size: '3.5" x 2"', category: 'print' },
            { id: 'business_card_set', name: 'Business Card - Full Set', size: '3.5" x 2" (Front & Back)', category: 'print' },
            { id: 'flyer_letter', name: 'Flyer - Letter', size: '8.5" x 11"', category: 'print' },
            { id: 'flyer_half', name: 'Flyer - Half Page', size: '5.5" x 8.5"', category: 'print' },
            { id: 'postcard_4x6', name: 'Postcard/Mailer', size: '4" x 6"', category: 'print' },
            { id: 'postcard_5x7', name: 'Postcard/Mailer', size: '5" x 7"', category: 'print' },
            { id: 'postcard_6x9', name: 'Postcard/Mailer', size: '6" x 9"', category: 'print' },
            { id: 'rack_card', name: 'Rack Card', size: '4" x 9"', category: 'print' },
            { id: 'brochure_trifold_outside', name: 'Brochure Tri-fold - Outside', size: '8.5" x 11" (folded)', category: 'print' },
            { id: 'brochure_trifold_inside', name: 'Brochure Tri-fold - Inside', size: '8.5" x 11" (folded)', category: 'print' },
            { id: 'brochure_bifold_outside', name: 'Brochure Bi-fold - Outside', size: '8.5" x 11" (folded)', category: 'print' },
            { id: 'brochure_bifold_inside', name: 'Brochure Bi-fold - Inside', size: '8.5" x 11" (folded)', category: 'print' },
            { id: 'door_hanger', name: 'Door Hanger', size: '4.25" x 11"', category: 'print' },
            { id: 'bookmark', name: 'Bookmark', size: '2" x 6"', category: 'print' }
        ]
    },
    labels: {
        name: 'Labels & Packaging',
        icon: '🏷️',
        types: [
            { id: 'label_circle_2', name: 'Circle Label', size: '2" diameter', category: 'labels' },
            { id: 'label_circle_3', name: 'Circle Label', size: '3" diameter', category: 'labels' },
            { id: 'label_square_2', name: 'Square Label', size: '2" x 2"', category: 'labels' },
            { id: 'label_rect_2x3', name: 'Rectangle Label', size: '2" x 3"', category: 'labels' },
            { id: 'label_rect_3x4', name: 'Rectangle Label', size: '3" x 4"', category: 'labels' },
            { id: 'product_label', name: 'Product Label - Custom', size: 'Custom size', category: 'labels' },
            { id: 'bottle_label', name: 'Bottle/Jar Label', size: 'Wrap-around', category: 'labels' },
            { id: 'box_packaging', name: 'Box/Packaging Design', size: 'Custom', category: 'labels' },
            { id: 'hang_tag', name: 'Hang Tag', size: '2" x 3.5"', category: 'labels' }
        ]
    },
    banners: {
        name: 'Banners & Signage',
        icon: '🚩',
        types: [
            { id: 'banner_stand_24x63', name: 'Retractable Banner Stand', size: '24" x 63"', category: 'banners' },
            { id: 'banner_stand_33x81', name: 'Retractable Banner Stand', size: '33" x 81"', category: 'banners' },
            { id: 'banner_stand_36x92', name: 'Retractable Banner Stand', size: '36" x 92"', category: 'banners' },
            { id: 'vinyl_banner_3x6', name: 'Vinyl Banner', size: '3\' x 6\'', category: 'banners' },
            { id: 'vinyl_banner_4x8', name: 'Vinyl Banner', size: '4\' x 8\'', category: 'banners' },
            { id: 'vinyl_banner_custom', name: 'Vinyl Banner - Custom', size: 'Custom size', category: 'banners' },
            { id: 'yard_sign_18x24', name: 'Yard Sign', size: '18" x 24"', category: 'banners' },
            { id: 'yard_sign_24x36', name: 'Yard Sign', size: '24" x 36"', category: 'banners' },
            { id: 'a_frame', name: 'A-Frame Sign', size: '24" x 36"', category: 'banners' },
            { id: 'window_cling', name: 'Window Cling/Decal', size: 'Custom', category: 'banners' },
            { id: 'vinyl_decal', name: 'Vinyl Decal Design', size: 'Custom', category: 'banners' },
            { id: 'wall_graphic', name: 'Wall Graphic/Mural', size: 'Custom', category: 'banners' }
        ]
    },
    posters: {
        name: 'Posters & Large Format',
        icon: '🖼️',
        types: [
            { id: 'poster_11x17', name: 'Poster - Tabloid', size: '11" x 17"', category: 'posters' },
            { id: 'poster_18x24', name: 'Poster - Small', size: '18" x 24"', category: 'posters' },
            { id: 'poster_24x36', name: 'Poster - Medium', size: '24" x 36"', category: 'posters' },
            { id: 'poster_27x40', name: 'Poster - Movie Size', size: '27" x 40"', category: 'posters' },
            { id: 'poster_36x48', name: 'Poster - Large', size: '36" x 48"', category: 'posters' },
            { id: 'canvas_16x20', name: 'Canvas Print', size: '16" x 20"', category: 'posters' },
            { id: 'canvas_24x36', name: 'Canvas Print', size: '24" x 36"', category: 'posters' },
            { id: 'foam_board', name: 'Foam Board Display', size: 'Custom', category: 'posters' }
        ]
    },
    digital: {
        name: 'Digital & Web',
        icon: '💻',
        types: [
            { id: 'web_banner_728x90', name: 'Leaderboard Banner', size: '728 x 90 px', category: 'digital' },
            { id: 'web_banner_300x250', name: 'Medium Rectangle', size: '300 x 250 px', category: 'digital' },
            { id: 'web_banner_160x600', name: 'Wide Skyscraper', size: '160 x 600 px', category: 'digital' },
            { id: 'web_banner_300x600', name: 'Half Page', size: '300 x 600 px', category: 'digital' },
            { id: 'social_fb_cover', name: 'Facebook Cover', size: '820 x 312 px', category: 'digital' },
            { id: 'social_fb_post', name: 'Facebook Post', size: '1200 x 630 px', category: 'digital' },
            { id: 'social_ig_post', name: 'Instagram Post', size: '1080 x 1080 px', category: 'digital' },
            { id: 'social_ig_story', name: 'Instagram Story', size: '1080 x 1920 px', category: 'digital' },
            { id: 'social_linkedin', name: 'LinkedIn Banner', size: '1584 x 396 px', category: 'digital' },
            { id: 'social_twitter', name: 'Twitter/X Header', size: '1500 x 500 px', category: 'digital' },
            { id: 'social_youtube', name: 'YouTube Thumbnail', size: '1280 x 720 px', category: 'digital' },
            { id: 'email_header', name: 'Email Header', size: '600 x 200 px', category: 'digital' },
            { id: 'email_template', name: 'Email Template', size: '600 px wide', category: 'digital' }
        ]
    },
    video: {
        name: 'Video Content',
        icon: '🎬',
        types: [
            { id: 'video_reel', name: 'Instagram/TikTok Reel', size: '1080 x 1920 px (9:16)', category: 'video', isVideo: true },
            { id: 'video_story', name: 'Story Video', size: '1080 x 1920 px (9:16)', category: 'video', isVideo: true },
            { id: 'video_square', name: 'Square Video (Feed)', size: '1080 x 1080 px (1:1)', category: 'video', isVideo: true },
            { id: 'video_landscape', name: 'Landscape Video', size: '1920 x 1080 px (16:9)', category: 'video', isVideo: true },
            { id: 'video_brand', name: 'Brand Video', size: '1920 x 1080 px (16:9)', category: 'video', isVideo: true },
            { id: 'video_promo', name: 'Promo/Ad Video', size: 'Various', category: 'video', isVideo: true },
            { id: 'video_logo_animation', name: 'Logo Animation', size: 'Various', category: 'video', isVideo: true },
            { id: 'video_intro_outro', name: 'Intro/Outro', size: '1920 x 1080 px', category: 'video', isVideo: true }
        ]
    },
    branding: {
        name: 'Brand Identity',
        icon: '✨',
        types: [
            { id: 'logo_primary', name: 'Logo - Primary', size: 'Vector/High-res', category: 'branding' },
            { id: 'logo_secondary', name: 'Logo - Secondary', size: 'Vector/High-res', category: 'branding' },
            { id: 'logo_icon', name: 'Logo Icon/Mark', size: 'Vector/High-res', category: 'branding' },
            { id: 'logo_wordmark', name: 'Logo Wordmark', size: 'Vector/High-res', category: 'branding' },
            { id: 'logo_variations', name: 'Logo Color Variations', size: 'Multiple', category: 'branding' },
            { id: 'brand_pattern', name: 'Brand Pattern', size: 'Seamless tile', category: 'branding' },
            { id: 'brand_icons', name: 'Custom Icon Set', size: 'Various', category: 'branding' },
            { id: 'letterhead', name: 'Letterhead Design', size: '8.5" x 11"', category: 'branding' },
            { id: 'envelope', name: 'Envelope Design', size: '#10 (4.125" x 9.5")', category: 'branding' },
            { id: 'presentation_template', name: 'Presentation Template', size: '16:9', category: 'branding' }
        ]
    },
    website: {
        name: 'Website & App',
        icon: '🌐',
        types: [
            { id: 'website_full', name: 'Full Website', size: 'Responsive', category: 'website', isLink: true },
            { id: 'website_homepage', name: 'Homepage Design', size: 'Desktop & Mobile', category: 'website', isLink: true },
            { id: 'website_landing', name: 'Landing Page', size: 'Responsive', category: 'website', isLink: true },
            { id: 'website_inner', name: 'Inner Page', size: 'Responsive', category: 'website', isLink: true },
            { id: 'webapp_dashboard', name: 'Web App Dashboard', size: 'Desktop', category: 'website', isLink: true },
            { id: 'webapp_mobile', name: 'Mobile App Screen', size: 'Mobile', category: 'website', isLink: true },
            { id: 'webapp_feature', name: 'App Feature/Flow', size: 'Various', category: 'website', isLink: true },
            { id: 'ecommerce_product', name: 'E-commerce Product Page', size: 'Responsive', category: 'website', isLink: true },
            { id: 'ecommerce_checkout', name: 'Checkout Flow', size: 'Responsive', category: 'website', isLink: true },
            { id: 'prototype_figma', name: 'Figma Prototype', size: 'Interactive', category: 'website', isLink: true },
            { id: 'prototype_xd', name: 'Adobe XD Prototype', size: 'Interactive', category: 'website', isLink: true },
            { id: 'staging_site', name: 'Staging/Dev Site', size: 'Full Site', category: 'website', isLink: true }
        ]
    }
};

let proofFilterCategory = 'all';
let proofFilterStatus = 'all';

function loadAdminProofsPanel() {
    const filteredProofs = proofs.filter(p => {
        const categoryMatch = proofFilterCategory === 'all' || p.category === proofFilterCategory;
        const statusMatch = proofFilterStatus === 'all' || p.status === proofFilterStatus;
        return categoryMatch && statusMatch;
    });

    const pendingCount = proofs.filter(p => p.status === 'pending').length;
    const approvedCount = proofs.filter(p => p.status === 'approved').length;
    const revisionCount = proofs.filter(p => p.status === 'revision').length;

    document.getElementById('adminProofsPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">✅ Proof Approval Center</h2>
<p class="panel-subtitle">Create, manage, and approve design proofs across all formats</p>
</div>

        <!-- Stats Row -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
<div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 20px; border-radius: 12px; color: #fff;">
<div style="font-size: 32px; font-weight: 700;">${proofs.length}</div>
<div style="font-size: 14px; opacity: 0.9;">Total Proofs</div>
</div>
<div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; color: #fff;">
<div style="font-size: 32px; font-weight: 700;">${pendingCount}</div>
<div style="font-size: 14px; opacity: 0.9;">Pending Review</div>
</div>
<div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; color: #fff;">
<div style="font-size: 32px; font-weight: 700;">${approvedCount}</div>
<div style="font-size: 14px; opacity: 0.9;">Approved</div>
</div>
<div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 12px; color: #fff;">
<div style="font-size: 32px; font-weight: 700;">${revisionCount}</div>
<div style="font-size: 14px; opacity: 0.9;">Needs Revision</div>
</div>
</div>

        <!-- Storage Indicator -->
<div style="background: #252525; border-radius: 12px; padding: 12px 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
<div style="display: flex; align-items: center; gap: 16px;">
<span class="text-muted-sm">💾 Storage:</span>
<span id="storageUsage" style="font-weight: 600; font-size: 13px;">${getStorageUsage().used} / ~5 MB</span>
<div style="width: 100px; height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
<div style="width: ${Math.min((getStorageUsage().usedBytes / 5000000) * 100, 100)}%; height: 100%; background: ${(getStorageUsage().usedBytes / 5000000) > 0.8 ? '#ef4444' : '#10b981'}; border-radius: 3px;"></div>
</div>
</div>
<div class="flex-gap-8">
<button onclick="showStorageManager()" style="padding: 6px 12px; background: #333; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    🗑️ Manage Storage
</button>
</div>
</div>

        <!-- Actions & Filters -->
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
<div class="flex-gap-12 flex-wrap">
<select onchange="proofFilterCategory = this.value; loadAdminProofsPanel();" style="padding: 10px 16px; border: 1px solid #333; border-radius: 8px; background: #1a1a1a; color: #fff;">
<option value="all" ${proofFilterCategory === 'all' ? 'selected' : ''}>All Categories</option>
                    ${Object.entries(PROOF_CATEGORIES).map(([key, cat]) => `<option value="${key}" ${proofFilterCategory === key ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`).join('')}
</select>
<select onchange="proofFilterStatus = this.value; loadAdminProofsPanel();" style="padding: 10px 16px; border: 1px solid #333; border-radius: 8px; background: #1a1a1a; color: #fff;">
<option value="all" ${proofFilterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
<option value="pending" ${proofFilterStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
<option value="approved" ${proofFilterStatus === 'approved' ? 'selected' : ''}>✅ Approved</option>
<option value="revision" ${proofFilterStatus === 'revision' ? 'selected' : ''}>🔄 Revision</option>
</select>
</div>
<button class="btn-cta" onclick="showCreateProofModal()" style="padding: 12px 24px;">
                + Create New Proof
</button>
</div>

        <!-- Proofs Grid -->
        ${filteredProofs.length === 0 ? `
<div style="background: #1a1a1a; border-radius: 16px; padding: 60px; text-align: center;">
<div style="font-size: 64px; margin-bottom: 16px;">📋</div>
<h3 style="font-size: 20px; margin-bottom: 8px;">No Proofs Found</h3>
<p class="text-muted mb-24">Create your first proof to get started</p>
<button class="btn-cta" onclick="showCreateProofModal()">+ Create Proof</button>
</div>
        ` : `
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
                ${filteredProofs.map(proof => renderEnhancedProofCard(proof)).join('')}
</div>
        `}
    `;
}

function renderEnhancedProofCard(proof) {
    const client = clients.find(c => c.id === proof.clientId) || { name: 'Unknown Client' };
    const proofType = getAllProofTypes().find(t => t.id === proof.proofType) || { name: proof.proofType || 'Custom', size: '', icon: '📄' };
    const categoryData = PROOF_CATEGORIES[proof.category] || { icon: '📄', name: 'Other' };
    const isVideo = proof.isVideo || proofType.isVideo;
    const isLink = proof.isLink || proofType?.isLink;

    const statusColors = {
        pending: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
        approved: { bg: '#d1fae5', text: '#065f46', icon: '✅' },
        revision: { bg: '#fee2e2', text: '#991b1b', icon: '🔄' }
    };
    const status = statusColors[proof.status] || statusColors.pending;

    // Determine preview content
    let previewContent = '';
    if (isLink && proof.previewUrl) {
        previewContent = proof.thumbnail
            ? `<img alt="Design proof thumbnail" loading="lazy" src="${proof.thumbnail}" style="max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.8;">`
            : `<div style="text-align: center; color: #3b82f6;">
<div style="font-size: 48px; margin-bottom: 8px;">🌐</div>
<div style="font-size: 12px; word-break: break-all; padding: 0 20px;">${proof.previewUrl.substring(0, 40)}...</div>
</div>`;
    } else if (isVideo && proof.videoUrl) {
        previewContent = `<video src="${proof.videoUrl}" style="max-width: 100%; max-height: 100%;" controls></video>`;
    } else if (isVideo) {
        previewContent = `<div style="text-align: center; color: #666;"><div style="font-size: 48px; margin-bottom: 8px;">🎬</div><div>Video Proof</div></div>`;
    } else if (proof.image) {
        previewContent = `<img alt="Design proof full image" loading="lazy" src="${proof.image}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
    } else {
        previewContent = `<div style="text-align: center; color: #666;"><div style="font-size: 48px; margin-bottom: 8px;">${categoryData.icon}</div><div>No Preview</div></div>`;
    }

    return `
<div style="background: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
            <!-- Preview Area -->
<div style="position: relative; height: 200px; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${previewContent}
                ${isLink ? `
<div style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);">
<button onclick="window.open('${proof.previewUrl}', '_blank')" style="padding: 8px 16px; background: #3b82f6; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            🔗 Open Preview
</button>
</div>
                ` : ''}
                <!-- Category Badge -->
<div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 20px; font-size: 12px;">
                    ${categoryData.icon} ${proofType.name}
</div>
                <!-- Status Badge -->
<div style="position: absolute; top: 12px; right: 12px; background: ${status.bg}; color: ${status.text}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${status.icon} ${proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
</div>
</div>

            <!-- Info Area -->
<div style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${proof.name}</h3>
<div style="display: flex; gap: 16px; color: #888; font-size: 13px; margin-bottom: 12px; flex-wrap: wrap;">
<span>👤 ${client.name}</span>
<span>📐 ${proofType.size || 'Custom'}</span>
                    ${isLink ? '<span style="color: #3b82f6;">🔗 Link</span>' : ''}
</div>
<div style="font-size: 12px; color: #666; margin-bottom: 16px;">
                    Version ${proof.version || 1} • ${proof.createdAt ? new Date(proof.createdAt).toLocaleDateString() : 'N/A'}
</div>

                ${proof.comments && proof.comments.length > 0 ? `
<div style="background: #252525; padding: 12px; border-radius: 8px; margin-bottom: 16px; max-height: 80px; overflow-y: auto;">
<div style="font-size: 11px; color: #888; margin-bottom: 8px;">LATEST FEEDBACK (${proof.comments.length})</div>
<div style="font-size: 13px; color: #ccc;">${proof.comments[proof.comments.length - 1].text}</div>
</div>
                ` : ''}

                <!-- Action Buttons -->
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${isLink ? `<button onclick="openProofPreview(${proof.id})" style="padding: 10px 14px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">🔗 Preview & Comment</button>` : ''}
                    ${proof.status !== 'approved' ? `
<button onclick="approveProof(${proof.id})" style="flex: 1; padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ✓ Approve
</button>
<button onclick="requestRevisionModal(${proof.id})" style="flex: 1; padding: 10px; background: #ef4444; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ↻ Revision
</button>
                    ` : `
<button onclick="viewApprovedAsset(${proof.id})" style="flex: 1; padding: 10px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📁 View in Brand Guide
</button>
                    `}
<button onclick="viewProofDetails(${proof.id})" style="padding: 10px 16px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer;">
                        👁️
</button>
</div>
</div>
</div>
    `;
}

function getAllProofTypes() {
    const allTypes = [];
    Object.values(PROOF_CATEGORIES).forEach(cat => {
        cat.types.forEach(type => allTypes.push(type));
    });
    return allTypes;
}

// Enhanced Create Proof Modal
function showCreateProofModal() {
    const modal = document.createElement('div');
    modal.id = 'createProofModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 20px; width: 100%; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <!-- Header -->
<div style="padding: 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #1a1a1a; z-index: 10;">
<div>
<h2 class="fs-24 fw-700">Create New Proof</h2>
<p class="text-muted fs-14">Select proof type, upload files, and send to client</p>
</div>
<button onclick="document.getElementById('createProofModal').remove()" style="background: none; border: none; color: #888; font-size: 28px; cursor: pointer; line-height: 1;">&times;</button>
</div>

                <!-- Body -->
<div class="p-24">
                    <!-- Step 1: Select Client & Project -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
<div>
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Client *</label>
<select id="proofClient" style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px;">
<option value="">Select client...</option>
                                ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
</select>
</div>
<div>
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Project/Order</label>
<select id="proofProject" style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px;">
<option value="">Select project...</option>
                                ${orders.map(o => `<option value="${o.id}">${o.projectName || o.service}</option>`).join('')}
</select>
</div>
</div>

                    <!-- Step 2: Select Proof Category -->
<div class="mb-24">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Proof Category *</label>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                            ${Object.entries(PROOF_CATEGORIES).map(([key, cat]) => `
<div onclick="selectProofCategory('${key}')" id="cat_${key}"
                                    style="background: #252525; border: 2px solid #333; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s;">
<div style="font-size: 28px; margin-bottom: 8px;">${cat.icon}</div>
<div style="font-size: 13px; font-weight: 500;">${cat.name}</div>
</div>
                            `).join('')}
</div>
</div>

                    <!-- Step 3: Select Specific Type (shown after category selected) -->
<div id="proofTypeSection" style="display: none; margin-bottom: 24px;">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Select Type & Size *</label>
<div id="proofTypeList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; max-height: 200px; overflow-y: auto; padding: 4px;"></div>
</div>

                    <!-- Step 4: Proof Details -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
<div>
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Proof Name *</label>
<input type="text" id="proofName" placeholder="e.g., Business Card Design v1"
                                style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px;">
</div>
<div>
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Version</label>
<input type="number" id="proofVersion" value="1" min="1"
                                style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px;">
</div>
</div>

                    <!-- Step 5: Upload Area (File Upload) -->
<div id="proofUploadSection" class="mb-24">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Upload Proof File *</label>
<div id="proofUploadZone" onclick="document.getElementById('proofFileInput').click()"
                            style="border: 2px dashed #444; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s;"
                            ondragover="event.preventDefault(); this.style.borderColor='#e11d48'; this.style.background='rgba(225,29,72,0.1)';"
                            ondragleave="this.style.borderColor='#444'; this.style.background='transparent';"
                            ondrop="handleProofFileDrop(event)">
<div style="font-size: 48px; margin-bottom: 12px;">📁</div>
<p style="color: #fff; font-size: 16px; margin-bottom: 8px;">Drop your file here</p>
<p class="text-muted fs-14">Images: PNG, JPG, PDF • Videos: MP4, MOV</p>
</div>
<input type="file" id="proofFileInput" accept="image/*,video/*,.pdf" class="hidden" onchange="handleProofFileSelect(this)">

                        <!-- Preview Area -->
<div id="proofPreviewArea" style="display: none; margin-top: 16px; background: #252525; border-radius: 12px; padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
<span class="fw-600">Preview</span>
<button onclick="clearProofUpload()" style="background: #ef4444; border: none; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Remove</button>
</div>
<div id="proofPreviewContent" class="text-center"></div>
</div>
</div>

                    <!-- Step 5b: URL Input (Website/App Proofs) -->
<div id="proofUrlSection" style="display: none; margin-bottom: 24px;">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px;">🔗 Website/App Preview URL *</label>
<div style="background: #252525; border-radius: 12px; padding: 20px;">
<input type="url" id="proofUrl" placeholder="https://example.com or https://figma.com/proto/..."
                                style="width: 100%; padding: 14px 16px; border: 2px solid #444; border-radius: 8px; background: #1a1a1a; color: #fff; font-size: 14px; margin-bottom: 12px;"
                                oninput="validateProofUrl(this.value)">
<div id="proofUrlPreview" style="display: none; margin-top: 12px;">
<div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
<div class="fs-32 mb-8">🌐</div>
<div id="proofUrlDisplay" style="color: #3b82f6; word-break: break-all;"></div>
<button onclick="window.open(document.getElementById('proofUrl').value, '_blank')"
                                        style="margin-top: 12px; padding: 8px 16px; background: #3b82f6; border: none; color: #fff; border-radius: 6px; cursor: pointer;">
                                        🔗 Test Link
</button>
</div>
</div>
<p style="color: #888; font-size: 12px; margin-top: 12px;">
                                Supported: Live websites, staging sites, Figma prototypes, Adobe XD, InVision, etc.
</p>
</div>

                        <!-- Optional Screenshot Upload -->
<div class="mt-16">
<label style="display: block; font-size: 13px; color: #888; margin-bottom: 8px;">Optional: Upload a screenshot for preview thumbnail</label>
<div onclick="document.getElementById('proofScreenshotInput').click()"
                                style="border: 1px dashed #444; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer;">
<span class="text-muted-sm">📷 Click to add screenshot</span>
</div>
<input type="file" id="proofScreenshotInput" accept="image/*" class="hidden" onchange="handleScreenshotUpload(this)">
<div id="screenshotPreview" style="display: none; margin-top: 8px; text-align: center;">
<img alt="Screenshot preview" loading="lazy" id="screenshotImg" style="max-width: 100%; max-height: 150px; border-radius: 8px;">
</div>
</div>
</div>

                    <!-- Step 6: Notes -->
<div class="mb-24">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Notes for Client</label>
<textarea id="proofNotes" rows="3" placeholder="Add any notes or instructions for the client..."
                            style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px; resize: vertical;"></textarea>
</div>

                    <!-- Notification Option -->
<div style="background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
<label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
<input type="checkbox" id="notifyClient" checked style="width: 20px; height: 20px; accent-color: #e11d48;">
<div>
<div class="fw-600">Notify Client</div>
<div class="text-muted-sm">Send email notification when proof is ready for review</div>
</div>
</label>
</div>
</div>

                <!-- Footer -->
<div style="padding: 24px; border-top: 1px solid #333; display: flex; justify-content: flex-end; gap: 12px; position: sticky; bottom: 0; background: #1a1a1a;">
<button onclick="document.getElementById('createProofModal').remove()" style="padding: 12px 24px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        Cancel
</button>
<button onclick="saveEnhancedProof()" style="padding: 12px 32px; background: linear-gradient(135deg, #e11d48, #be185d); border: none; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        Create Proof & Send to Client
</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

let selectedProofCategory = null;
let selectedProofType = null;
let proofFileData = null;

function selectProofCategory(categoryKey) {
    selectedProofCategory = categoryKey;

    // Update visual selection
    Object.keys(PROOF_CATEGORIES).forEach(key => {
        const el = document.getElementById('cat_' + key);
        if (el) {
            el.style.borderColor = key === categoryKey ? '#e11d48' : '#333';
            el.style.background = key === categoryKey ? 'rgba(225,29,72,0.1)' : '#252525';
        }
    });

    // Show type selection
    const typeSection = document.getElementById('proofTypeSection');
    const typeList = document.getElementById('proofTypeList');
    const category = PROOF_CATEGORIES[categoryKey];

    typeSection.style.display = 'block';
    typeList.innerHTML = category.types.map(type => `
<div onclick="selectProofType('${type.id}')" id="type_${type.id}"
            style="background: #333; border: 2px solid #444; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s;">
<div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${type.name}</div>
<div class="text-muted fs-12">${type.size}</div>
            ${type.isVideo ? '<div style="font-size: 11px; color: #e11d48; margin-top: 4px;">🎬 Video</div>' : ''}
            ${type.isLink ? '<div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">🔗 Link</div>' : ''}
</div>
    `).join('');

    // Update file input accept based on category
    const fileInput = document.getElementById('proofFileInput');
    const uploadSection = document.getElementById('proofUploadSection');
    const urlSection = document.getElementById('proofUrlSection');

    if (categoryKey === 'website') {
        // Show URL input for website proofs
        if (uploadSection) uploadSection.style.display = 'none';
        if (urlSection) urlSection.style.display = 'block';
    } else {
        // Show file upload for other proofs
        if (uploadSection) uploadSection.style.display = 'block';
        if (urlSection) urlSection.style.display = 'none';

        if (categoryKey === 'video') {
            fileInput.accept = 'video/*';
        } else {
            fileInput.accept = 'image/*,.pdf';
        }
    }
}

function selectProofType(typeId) {
    selectedProofType = typeId;
    const type = getAllProofTypes().find(t => t.id === typeId);

    // Update visual selection
    getAllProofTypes().forEach(t => {
        const el = document.getElementById('type_' + t.id);
        if (el) {
            el.style.borderColor = t.id === typeId ? '#e11d48' : '#444';
            el.style.background = t.id === typeId ? 'rgba(225,29,72,0.2)' : '#333';
        }
    });

    // Toggle between URL and file upload based on type
    const uploadSection = document.getElementById('proofUploadSection');
    const urlSection = document.getElementById('proofUrlSection');

    if (type && type.isLink) {
        if (uploadSection) uploadSection.style.display = 'none';
        if (urlSection) urlSection.style.display = 'block';
    } else if (selectedProofCategory !== 'website') {
        if (uploadSection) uploadSection.style.display = 'block';
        if (urlSection) urlSection.style.display = 'none';
    }

    // Auto-fill proof name if empty
    const nameInput = document.getElementById('proofName');
    if (!nameInput.value && type) {
        nameInput.value = type.name + ' v1';
    }
}

function handleProofFileDrop(event) {
    event.preventDefault();
    event.target.style.borderColor = '#444';
    event.target.style.background = 'transparent';

    const file = event.dataTransfer.files[0];
    if (file) {
        processProofFile(file);
    }
}

function handleProofFileSelect(input) {
    if (input.files && input.files[0]) {
        processProofFile(input.files[0]);
    }
}

function processProofFile(file) {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isVideo && !isImage && !isPDF) {
        alert('Please upload an image, video, or PDF file.');
        return;
    }

    // Check file size - warn if large
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
        alert(`⚠️ Large file (${fileSizeMB.toFixed(1)}MB). Images will be compressed. Videos will be stored as reference only.`);
    }

    const previewArea = document.getElementById('proofPreviewArea');
    const previewContent = document.getElementById('proofPreviewContent');

    if (isVideo) {
        // For videos, create a thumbnail and store reference (videos too large for localStorage)
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            video.currentTime = 1; // Seek to 1 second for thumbnail
        };
        video.onseeked = function() {
            // Create thumbnail from video frame
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.6);

            proofFileData = {
                data: null, // Don't store full video in localStorage
                thumbnail: thumbnail,
                type: file.type,
                name: file.name,
                isVideo: true,
                videoFile: file, // Keep file reference for display
                duration: video.duration
            };

            previewArea.style.display = 'block';
            previewContent.innerHTML = `
<div style="position: relative;">
<img alt="Proof thumbnail preview" loading="lazy" src="${thumbnail}" style="max-width: 100%; max-height: 300px; border-radius: 8px; opacity: 0.8;">
<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px;">▶️</div>
</div>
<div style="margin-top: 8px; color: #888; font-size: 13px;">🎬 ${file.name} (${fileSizeMB.toFixed(1)}MB)</div>
<div style="margin-top: 4px; color: #f59e0b; font-size: 11px;">⚠️ Video stored as thumbnail reference only</div>
            `;

            URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
    } else if (isPDF) {
        // For PDFs, store minimal reference
        proofFileData = {
            data: null,
            type: file.type,
            name: file.name,
            isVideo: false,
            isPDF: true,
            fileSize: fileSizeMB.toFixed(1) + 'MB'
        };

        previewArea.style.display = 'block';
        previewContent.innerHTML = `
<div style="background: #333; padding: 40px; border-radius: 8px;">
<div style="font-size: 48px; margin-bottom: 12px;">📄</div>
<div class="fw-600">${file.name}</div>
<div style="color: #888; font-size: 13px; margin-top: 4px;">PDF Document (${fileSizeMB.toFixed(1)}MB)</div>
</div>
<div style="margin-top: 8px; color: #f59e0b; font-size: 11px;">⚠️ PDF stored as reference only</div>
        `;
    } else {
        // For images, compress before storing
        const reader = new FileReader();
        reader.onload = async e => {
            // Compress image
            const compressed = await compressImage(e.target.result, 800, 0.6);
            const compressedSize = (compressed.length * 0.75 / 1024).toFixed(0); // Approximate KB

            proofFileData = {
                data: compressed,
                type: 'image/jpeg',
                name: file.name,
                isVideo: false,
                originalSize: fileSizeMB.toFixed(1) + 'MB',
                compressedSize: compressedSize + 'KB'
            };

            previewArea.style.display = 'block';
            previewContent.innerHTML = `
<img alt="Compressed proof image" loading="lazy" src="${compressed}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
<div style="margin-top: 8px; color: #888; font-size: 13px;">🖼️ ${file.name}</div>
<div style="margin-top: 4px; color: #10b981; font-size: 11px;">✓ Compressed: ${fileSizeMB.toFixed(1)}MB → ${compressedSize}KB</div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function clearProofUpload() {
    proofFileData = null;
    document.getElementById('proofPreviewArea').style.display = 'none';
    document.getElementById('proofFileInput').value = '';
}

// URL validation for website proofs
let proofUrlData = null;
let proofScreenshotData = null;

function validateProofUrl(url) {
    const preview = document.getElementById('proofUrlPreview');
    const display = document.getElementById('proofUrlDisplay');

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        proofUrlData = url;
        preview.style.display = 'block';
        display.textContent = url;
    } else {
        proofUrlData = null;
        preview.style.display = 'none';
    }
}

function handleScreenshotUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            // Compress the screenshot
            const compressed = await compressImage(e.target.result, 600, 0.6);
            proofScreenshotData = compressed;

            document.getElementById('screenshotPreview').style.display = 'block';
            document.getElementById('screenshotImg').src = compressed;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearUrlProof() {
    proofUrlData = null;
    proofScreenshotData = null;
    document.getElementById('proofUrl').value = '';
    document.getElementById('proofUrlPreview').style.display = 'none';
    document.getElementById('screenshotPreview').style.display = 'none';
    document.getElementById('proofScreenshotInput').value = '';
}

function saveEnhancedProof() {
    const clientId = parseInt(document.getElementById('proofClient').value);
    const projectId = parseInt(document.getElementById('proofProject').value) || null;
    const name = document.getElementById('proofName').value.trim();
    const version = parseInt(document.getElementById('proofVersion').value) || 1;
    const notes = document.getElementById('proofNotes').value.trim();
    const notifyClient = document.getElementById('notifyClient').checked;

    const proofType = getAllProofTypes().find(t => t.id === selectedProofType);
    const isLinkProof = proofType?.isLink || selectedProofCategory === 'website';

    // Validation
    if (!clientId) {
        alert('Please select a client.');
        return;
    }
    if (!selectedProofCategory) {
        alert('Please select a proof category.');
        return;
    }
    if (!selectedProofType) {
        alert('Please select a proof type.');
        return;
    }
    if (!name) {
        alert('Please enter a proof name.');
        return;
    }

    // Check for either file or URL depending on type
    if (isLinkProof) {
        if (!proofUrlData) {
            alert('Please enter a valid URL for this website/app proof.');
            return;
        }
    } else {
        if (!proofFileData) {
            alert('Please upload a proof file.');
            return;
        }
    }

    const proof = {
        id: Date.now(),
        name: name,
        clientId: clientId,
        projectId: projectId,
        orderId: projectId,
        category: selectedProofCategory,
        proofType: selectedProofType,
        proofTypeName: proofType?.name || 'Custom',
        proofSize: proofType?.size || '',
        isLink: isLinkProof,
        isVideo: proofFileData?.isVideo || false,
        // For link proofs
        previewUrl: isLinkProof ? proofUrlData : null,
        thumbnail: isLinkProof ? proofScreenshotData : null,
        // For file proofs
        image: !isLinkProof && proofFileData && !proofFileData.isVideo ? proofFileData.data : null,
        videoUrl: !isLinkProof && proofFileData?.isVideo ? proofFileData.data : null,
        fileName: proofFileData?.name || null,
        fileType: proofFileData?.type || null,
        version: version,
        status: 'pending',
        notes: notes,
        comments: [],
        createdAt: new Date().toISOString(),
        notifyClient: notifyClient
    };

    proofs.push(proof);
    saveProofs();

    // Reset state
    selectedProofCategory = null;
    selectedProofType = null;
    proofFileData = null;

    document.getElementById('createProofModal').remove();
    loadAdminProofsPanel();

    if (notifyClient) {
        const client = clients.find(c => c.id === clientId);
        alert(`✅ Proof created!\n\n📧 Notification sent to ${client?.name || 'client'} for review.`);
    } else {
        alert('✅ Proof created successfully!');
    }
}

// Legacy function for compatibility
function showAddProofModal() {
    showCreateProofModal();
}

function previewProofImage(input) {
    if (input.files && input.files[0]) {
        processProofFile(input.files[0]);
    }
}

function saveProof() {
    saveEnhancedProof();
}

async function approveProof(id) {
    const proof = proofs.find(p => p.id === id);
    if (proof) {
        proof.status = 'approved';
        proof.approvedAt = new Date().toISOString();
        saveProofs();

        // Find matching order and update status
        if (proof.orderId || proof.order_id) {
            const orderIdx = orders.findIndex(o => o.id == (proof.orderId || proof.order_id));
            if (orderIdx !== -1) {
                orders[orderIdx].status = 'delivered';
                orders[orderIdx].progress = 100;
                saveOrders();
            }
        }

        // Save to client's brand assets
        saveProofToBrandAssets(proof);

        // Trigger workflow: Check payment and enable downloads
        triggerProofApproved(id);
        loadAdminProofsPanel();

        const client = clients.find(c => c.id === proof.clientId);

        // Notify designer that proof was approved
        if (proof.designerId) {
            addDesignerMessage(proof.designerId, proof.projectId, `✅ Your proof "${proof.name}" has been approved!`, 'system', true);
        }

        // Email client that their proof is approved
        if (client?.email) {
            simulateEmailNotification(
                client.email,
                `✅ Your ${proof.name || 'Proof'} Has Been Approved!`,
                `Great news! Your proof "${proof.name}" has been approved. ${checkClientPaymentStatus(proof.clientId) ? 'Your files are ready for download in your client portal.' : 'Complete your payment to unlock the final deliverable files.'}`
            );
        }

        // Log to CRM
        logProofActivity('approved', proof, `Proof "${proof.name}" approved for ${client?.name || 'client'}`);

        alert(`✅ Proof approved!\n\nAsset saved to ${client?.name || 'client'}'s Brand Guide.${client?.email ? '\n📧 Client notified via email.' : ''}`);
    }
}

// Save approved proof to client's brand assets
function saveProofToBrandAssets(proof) {
    const client = clients.find(c => c.id === proof.clientId);
    if (!client) return;

    // Initialize brand assets if needed
    if (!client.brandAssets) {
        client.brandAssets = { logo: '', colors: [], fonts: [], files: [] };
    }
    if (!client.brandAssets.files) {
        client.brandAssets.files = [];
    }

    // Create asset entry
    const asset = {
        id: Date.now(),
        proofId: proof.id,
        name: proof.name,
        category: proof.category,
        type: proof.proofType,
        typeName: proof.proofTypeName,
        size: proof.proofSize,
        isVideo: proof.isVideo,
        image: proof.image,
        videoUrl: proof.videoUrl,
        fileName: proof.fileName,
        fileType: proof.fileType,
        approvedAt: proof.approvedAt,
        version: proof.version
    };

    // Add to brand assets
    client.brandAssets.files.push(asset);

    // If it's a logo, also set as primary logo
    if (proof.proofType && proof.proofType.includes('logo') && proof.image) {
        client.brandAssets.logo = proof.image;
    }

    // Save clients
    localStorage.setItem('nui_clients', JSON.stringify(clients));

    // Also add to brand guide entries
    const brandGuideEntries = JSON.parse(localStorage.getItem('nui_brand_guide_entries')) || [];
    brandGuideEntries.push({
        id: Date.now(),
        clientId: proof.clientId,
        assetType: proof.category,
        assetName: proof.name,
        assetUrl: proof.image || proof.videoUrl,
        proofId: proof.id,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('nui_brand_guide_entries', JSON.stringify(brandGuideEntries));
}

function requestRevisionModal(id) {
    const proof = proofs.find(p => p.id === id);
    if (!proof) return;

    const modal = document.createElement('div');
    modal.id = 'revisionModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 16px; padding: 32px; max-width: 500px; width: 100%;">
<h2 style="font-size: 20px; margin-bottom: 8px;">🔄 Request Revision</h2>
<p style="color: #888; font-size: 14px; margin-bottom: 24px;">Provide feedback for "${proof.name}"</p>

<div class="mb-20">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Revision Feedback *</label>
<textarea id="revisionFeedback" rows="4" placeholder="Describe what changes are needed..."
                        style="width: 100%; padding: 12px; border: 1px solid #333; border-radius: 8px; background: #252525; color: #fff; font-size: 14px; resize: vertical;"></textarea>
</div>

<div class="mb-24">
<label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Quick Feedback Options</label>
<div class="flex-wrap">
                        ${['Color adjustment needed', 'Font change required', 'Layout revision', 'Size/dimension issue', 'Text/copy change', 'Image quality issue'].map(opt => `
<button onclick="document.getElementById('revisionFeedback').value += '${opt}. '"
                                style="padding: 8px 12px; background: #333; border: none; color: #fff; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                ${opt}
</button>
                        `).join('')}
</div>
</div>

<div class="flex-gap-12">
<button onclick="document.getElementById('revisionModal').remove()"
                        style="flex: 1; padding: 12px; background: #333; border: none; color: #fff; border-radius: 8px; cursor: pointer;">
                        Cancel
</button>
<button onclick="submitProofRevision(${id})"
                        style="flex: 1; padding: 12px; background: #ef4444; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Send Revision Request
</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

async function submitProofRevision(id) {
    const feedback = document.getElementById('revisionFeedback').value.trim();
    if (!feedback) {
        alert('Please provide revision feedback.');
        return;
    }

    const proof = proofs.find(p => p.id === id);
    if (proof) {
        proof.status = 'revision';
        proof.revisionCount = (proof.revisionCount || 0) + 1;
        proof.comments = proof.comments || [];
        proof.comments.push({
            author: currentUser?.email || 'Admin',
            text: feedback,
            createdAt: new Date().toISOString()
        });
        proof.updatedAt = new Date().toISOString();
        saveProofs();

        // Notify designer via messaging
        if (proof.designerId) {
            addDesignerMessage(proof.designerId, proof.projectId, `🔄 Revision requested for "${proof.name}": ${feedback}`, 'revision', true);
        }

        // Email designer about the revision
        const designers = JSON.parse(localStorage.getItem('nui_designers') || '[]');
        const designer = designers.find(d => d.id === proof.designerId);
        if (designer?.email) {
            try {
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: designer.email,
                        subject: `🔄 Revision Requested: ${proof.name}`,
                        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 24px; text-align: center;">
<h2 style="margin: 0; font-size: 20px; color: #fff;">🔄 Revision Requested</h2>
</div>
<div class="p-32">
<p class="text-light">Hey ${designer.name || 'Designer'},</p>
<p class="text-light">A revision has been requested for <strong>"${proof.name}"</strong>.</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<p style="color: #f59e0b; font-weight: 600; margin-bottom: 8px;">Feedback:</p>
<p style="color: #fff; font-size: 15px; line-height: 1.6;">${feedback}</p>
</div>
<p class="text-muted-sm">This is revision #${proof.revisionCount}. Log into the designer portal to upload the updated proof.</p>
</div>
</div>`,
                        text: `Revision requested for "${proof.name}": ${feedback}. This is revision #${proof.revisionCount}.`
                    })
                });
                console.log('📧 Designer notified of revision');
            } catch (err) {
                console.log('Designer email failed:', err.message);
            }
        }

        // Log to CRM
        logProofActivity('revision', proof, `Revision #${proof.revisionCount} requested for "${proof.name}": ${feedback}`);

        document.getElementById('revisionModal').remove();
        loadAdminProofsPanel();

        const client = clients.find(c => c.id === proof.clientId);
        alert(`🔄 Revision requested.\n\n${designer?.email ? '📧 Designer notified via email.' : 'Feedback posted to designer messages.'}`);
    }
}

function requestRevision(id) {
    requestRevisionModal(id);
}

function viewProofDetails(id) {
    const proof = proofs.find(p => p.id === id);
    if (!proof) return;

    const client = clients.find(c => c.id === proof.clientId) || { name: 'Unknown' };
    const proofType = getAllProofTypes().find(t => t.id === proof.proofType) || { name: 'Custom', size: '' };

    const modal = document.createElement('div');
    modal.id = 'proofDetailsModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
<div style="padding: 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
<h2 class="fs-20">Proof Details</h2>
<button onclick="document.getElementById('proofDetailsModal').remove()" style="background: none; border: none; color: #888; font-size: 28px; cursor: pointer;">&times;</button>
</div>

<div class="p-24">
                    <!-- Preview -->
<div style="background: #111; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                        ${proof.isVideo && proof.videoUrl ? `
<video src="${proof.videoUrl}" style="max-width: 100%; max-height: 400px; border-radius: 8px;" controls></video>
                        ` : proof.image ? `
<img alt="Proof revision image" loading="lazy" src="${proof.image}" style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                        ` : `
<div style="padding: 60px; color: #666;">No preview available</div>
                        `}
</div>

                    <!-- Info Grid -->
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Proof Name</div>
<div class="fw-600">${proof.name}</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Client</div>
<div class="fw-600">${client.name}</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Type</div>
<div class="fw-600">${proofType.name}</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Size</div>
<div class="fw-600">${proofType.size || proof.proofSize || 'Custom'}</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Version</div>
<div class="fw-600">v${proof.version || 1}</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div class="text-muted fs-12 mb-4">Status</div>
<div style="font-weight: 600; text-transform: capitalize;">${proof.status}</div>
</div>
</div>

                    ${proof.notes ? `
<div style="background: #252525; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
<div style="font-size: 12px; color: #888; margin-bottom: 8px;">Notes</div>
<div>${proof.notes}</div>
</div>
                    ` : ''}

                    ${proof.comments && proof.comments.length > 0 ? `
<div style="background: #252525; padding: 16px; border-radius: 8px;">
<div style="font-size: 12px; color: #888; margin-bottom: 12px;">Feedback History</div>
                            ${proof.comments.map(c => `
<div style="border-left: 3px solid #e11d48; padding-left: 12px; margin-bottom: 12px;">
<div class="text-muted fs-12">${c.author} • ${new Date(c.createdAt).toLocaleString()}</div>
<div style="margin-top: 4px;">${c.text}</div>
</div>
                            `).join('')}
</div>
                    ` : ''}
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function viewApprovedAsset(proofId) {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    // Switch to brand guide panel with this client selected
    showAdminPanel('brandguide');

    // Could also show a specific modal or filter to this client
    alert(`Asset "${proof.name}" is saved in the client's Brand Guide.\n\nNavigating to Brand Guide panel...`);
}

// Open proof preview with comment functionality (for website/link proofs)
function openProofPreview(proofId) {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    const client = clients.find(c => c.id === proof.clientId) || { name: 'Unknown' };
    const proofType = getAllProofTypes().find(t => t.id === proof.proofType) || { name: 'Custom' };

    const modal = document.createElement('div');
    modal.id = 'proofPreviewModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.95); display: flex; z-index: 9999;">
            <!-- Left: Preview Area -->
<div style="flex: 1; display: flex; flex-direction: column; border-right: 1px solid #333;">
<div style="padding: 16px 20px; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
<div>
<h2 style="font-size: 18px; margin-bottom: 4px;">${proof.name}</h2>
<div class="text-muted-sm">${proofType.name} • ${client.name}</div>
</div>
<div class="flex-gap-8">
                        ${proof.previewUrl ? `<button onclick="window.open('${proof.previewUrl}', '_blank')" style="padding: 8px 16px; background: #3b82f6; border: none; color: #fff; border-radius: 6px; cursor: pointer;">🔗 Open in New Tab</button>` : ''}
<button onclick="document.getElementById('proofPreviewModal').remove()" style="padding: 8px 16px; background: #333; border: none; color: #fff; border-radius: 6px; cursor: pointer;">✕ Close</button>
</div>
</div>
<div style="flex: 1; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${proof.previewUrl ? `
<iframe src="${proof.previewUrl}" style="width: 100%; height: 100%; border: none;" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
                    ` : proof.image ? `
<img alt="Proof approval image" loading="lazy" src="${proof.image}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    ` : `
<div style="text-align: center; color: #666;">
<div style="font-size: 64px; margin-bottom: 16px;">🌐</div>
<div>No preview available</div>
</div>
                    `}
</div>
</div>

            <!-- Right: Comments Panel -->
<div style="width: 380px; display: flex; flex-direction: column; background: #1a1a1a;">
<div style="padding: 20px; border-bottom: 1px solid #333;">
<h3 style="font-size: 16px; margin-bottom: 8px;">💬 Comments & Feedback</h3>
<div class="flex-gap-8">
<span class="order-status ${proof.status}" style="text-transform: capitalize;">${proof.status}</span>
<span style="color: #888; font-size: 12px;">v${proof.version || 1}</span>
</div>
</div>

                <!-- Comments List -->
<div id="proofCommentsList" style="flex: 1; overflow-y: auto; padding: 16px;">
                    ${(proof.comments || []).length === 0 ? `
<div style="text-align: center; color: #666; padding: 40px 20px;">
<div class="fs-32 mb-8">💬</div>
<div>No comments yet</div>
<div style="font-size: 12px; margin-top: 4px;">Be the first to leave feedback</div>
</div>
                    ` : (proof.comments || []).map(c => `
<div style="background: #252525; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
<div class="flex-between mb-8">
<span style="font-weight: 600; font-size: 13px;">${c.author}</span>
<span style="font-size: 11px; color: #888;">${new Date(c.createdAt).toLocaleString()}</span>
</div>
<div style="font-size: 14px; color: #ccc; line-height: 1.5;">${c.text}</div>
</div>
                    `).join('')}
</div>

                <!-- Add Comment -->
<div style="padding: 16px; border-top: 1px solid #333; background: #252525;">
<textarea id="newProofComment" rows="3" placeholder="Leave your feedback or request changes..."
                        style="width: 100%; padding: 12px; border: 1px solid #444; border-radius: 8px; background: #1a1a1a; color: #fff; font-size: 14px; resize: none; margin-bottom: 12px;"></textarea>
<div class="flex-gap-8">
<button onclick="addProofComment(${proof.id}, 'revision')" style="flex: 1; padding: 10px; background: #ef4444; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🔄 Request Changes
</button>
<button onclick="addProofComment(${proof.id}, 'approve')" style="flex: 1; padding: 10px; background: #10b981; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ✅ Approve
</button>
</div>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

// Add comment to proof
function addProofComment(proofId, action) {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    const commentText = document.getElementById('newProofComment').value.trim();
    const authorName = currentUser?.name || currentUser?.email || 'User';

    if (!commentText && action === 'revision') {
        alert('Please enter your feedback for the revision request.');
        return;
    }

    // Add comment
    proof.comments = proof.comments || [];
    if (commentText) {
        proof.comments.push({
            author: authorName,
            text: commentText,
            action: action,
            createdAt: new Date().toISOString()
        });
    }

    // Update status based on action
    if (action === 'approve') {
        proof.status = 'approved';
        proof.approvedAt = new Date().toISOString();
        saveProofToBrandAssets(proof);
        triggerProofApproved(proofId);
    } else if (action === 'revision') {
        proof.status = 'revision';
    }

    saveProofs();

    // Close modal and refresh
    document.getElementById('proofPreviewModal').remove();
    loadAdminProofsPanel();

    // Notify
    if (action === 'approve') {
        alert('✅ Proof approved! Asset saved to brand guide.');
    } else {
        alert('🔄 Revision requested. The design team has been notified.');
    }

    // Add to CRM communications
    addCrmCommunication(proof.clientId, action === 'approve' ? 'Proof Approved' : 'Revision Requested', commentText || `Proof "${proof.name}" ${action === 'approve' ? 'approved' : 'revision requested'}`);
}

// Add communication to CRM
function addCrmCommunication(clientId, type, message) {
    const communications = JSON.parse(localStorage.getItem('nui_crm_communications')) || [];
    communications.push({
        id: Date.now(),
        clientId: clientId,
        type: type,
        message: message,
        channel: 'proof_system',
        direction: 'inbound',
        createdAt: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('nui_crm_communications', JSON.stringify(communications));
}

// Storage Manager Modal
function showStorageManager() {
    const storage = getStorageUsage();
    const approvedProofs = proofs.filter(p => p.status === 'approved');
    const proofsWithImages = proofs.filter(p => p.image && p.image !== '[archived]');

    const modal = document.createElement('div');
    modal.id = 'storageManagerModal';
    modal.innerHTML = `
<div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
<div style="background: #1a1a1a; border-radius: 16px; padding: 32px; max-width: 500px; width: 100%;">
<div class="flex-between mb-24">
<h2 class="fs-20">💾 Storage Manager</h2>
<button onclick="document.getElementById('storageManagerModal').remove()" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
</div>

                <!-- Storage Usage -->
<div style="background: #252525; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
<div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
<span>Used Storage</span>
<span class="fw-600">${storage.used} / ~5 MB</span>
</div>
<div style="width: 100%; height: 12px; background: #333; border-radius: 6px; overflow: hidden;">
<div style="width: ${Math.min((storage.usedBytes / 5000000) * 100, 100)}%; height: 100%; background: ${(storage.usedBytes / 5000000) > 0.8 ? '#ef4444' : '#10b981'}; border-radius: 6px;"></div>
</div>
</div>

                <!-- Stats -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
<div style="background: #252525; padding: 16px; border-radius: 8px; text-align: center;">
<div class="fs-24 fw-700">${proofs.length}</div>
<div class="text-muted fs-12">Total Proofs</div>
</div>
<div style="background: #252525; padding: 16px; border-radius: 8px; text-align: center;">
<div class="fs-24 fw-700">${proofsWithImages.length}</div>
<div class="text-muted fs-12">With Images</div>
</div>
</div>

                <!-- Cleanup Options -->
<div class="flex-col-gap-12">
<button onclick="archiveOldProofs()" style="padding: 14px; background: #f59e0b; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        📦 Archive Old Approved Proofs (30+ days)
<div style="font-size: 11px; font-weight: normal; margin-top: 4px;">Keeps metadata, removes images</div>
</button>
<button onclick="clearRevisionProofs()" style="padding: 14px; background: #ef4444; border: none; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🗑️ Clear Old Revision Requests
<div style="font-size: 11px; font-weight: normal; margin-top: 4px;">Removes revision proofs older than 60 days</div>
</button>
<button onclick="if(confirm('Delete ALL proofs? This cannot be undone!')) { proofs = []; saveProofs(); document.getElementById('storageManagerModal').remove(); loadAdminProofsPanel(); }" style="padding: 14px; background: #333; border: 1px solid #ef4444; color: #ef4444; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        ⚠️ Delete All Proofs
</button>
</div>

<p style="color: #666; font-size: 11px; text-align: center; margin-top: 20px;">
                    💡 Tip: Images are compressed to ~100KB when uploaded to save space.
</p>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function archiveOldProofs() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let archived = 0;

    proofs.forEach(p => {
        if (p.status === 'approved' && p.approvedAt && new Date(p.approvedAt).getTime() < thirtyDaysAgo) {
            if (p.image && p.image !== '[archived]') {
                p.image = '[archived]';
                archived++;
            }
            if (p.videoUrl && p.videoUrl !== '[archived]') {
                p.videoUrl = '[archived]';
                archived++;
            }
        }
    });

    saveProofs();
    document.getElementById('storageManagerModal').remove();
    loadAdminProofsPanel();
    alert(`✅ Archived ${archived} proof file(s). Storage freed!`);
}

function clearRevisionProofs() {
    const sixtyDaysAgo = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const before = proofs.length;

    proofs = proofs.filter(p => {
        if (p.status === 'revision' && new Date(p.createdAt).getTime() < sixtyDaysAgo) {
            return false; // Remove old revision proofs
        }
        return true;
    });

    const removed = before - proofs.length;
    saveProofs();
    document.getElementById('storageManagerModal').remove();
    loadAdminProofsPanel();
    alert(`✅ Removed ${removed} old revision proof(s).`);
}

// ==================== DELIVERY PANEL ====================
function loadAdminDeliveryPanel() {
    const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'complete');
    const pendingDelivery = orders.filter(o => o.status === 'in_progress');
    const pendingProofs = proofs.filter(p => p.status === 'pending_admin' || p.status === 'pending');
    const approvedProofs = proofs.filter(p => p.status === 'approved');
    const revisionProofs = proofs.filter(p => p.status === 'revision');

    // Get recent proof activity for the timeline
    const recentActivity = [
        ...proofs.map(p => ({
            type: 'proof',
            status: p.status,
            name: p.name || p.fileName || p.title || 'Proof',
            project: p.projectName || orders.find(o => o.id === p.projectId)?.projectName || '',
            client: p.clientName || clients.find(c => c.id == p.clientId)?.name || '',
            designer: p.designerName || '',
            date: p.updatedAt || p.uploadedAt || p.createdAt,
            version: p.version,
            id: p.id
        })),
        ...deliveredOrders.map(o => ({
            type: 'delivery',
            status: 'delivered',
            name: o.projectName || o.project,
            client: clients.find(c => c.id === o.clientId)?.name || '',
            date: o.deliveredAt || o.updatedAt,
            id: o.id
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

    document.getElementById('adminDeliveryPanel').innerHTML = `
<div class="panel-header">
<h2 class="panel-title">📦 Delivery & Proofing</h2>
<p class="panel-subtitle">Manage proofs, deliverables, and client handoff — all activity in one place</p>
</div>

        <!-- Stats -->
<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px;">
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${pendingProofs.length}</div>
<div class="text-muted-sm">Proofs Pending</div>
</div>
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #ef4444;">${revisionProofs.length}</div>
<div class="text-muted-sm">In Revision</div>
</div>
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #10b981;">${approvedProofs.length}</div>
<div class="text-muted-sm">Approved</div>
</div>
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${pendingDelivery.length}</div>
<div class="text-muted-sm">Awaiting Delivery</div>
</div>
<div style="background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; text-align: center;">
<div style="font-size: 28px; font-weight: 700; color: #8b5cf6;">${deliveredOrders.length}</div>
<div class="text-muted-sm">Delivered</div>
</div>
</div>

        <!-- Pending Proofs from Designers -->
        ${pendingProofs.length > 0 ? `
<div class="form-section mb-24">
<div class="form-section-title">🔔 Proofs Awaiting Your Review</div>
            ${pendingProofs.map(p => {
                const project = orders.find(o => o.id === p.projectId);
                const client = clients.find(c => c.id == p.clientId);
                return `
<div style="background: #1a1a1a; padding: 16px 20px; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #f59e0b;">
<div>
<div class="fw-600">${p.name || p.fileName || 'Proof'} ${p.version ? '(v' + p.version + ')' : ''}</div>
<div class="text-muted-sm">${p.designerName || 'Designer'} • ${project?.projectName || ''} • ${client?.name || ''}</div>
<div style="color: #666; font-size: 12px;">${p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : ''}</div>
</div>
<div class="flex-gap-8">
<button class="btn-admin small" onclick="viewProofDetails(${p.id})">👁 View</button>
<button class="btn-admin small primary" onclick="approveProof(${p.id})">✅ Approve</button>
<button class="btn-admin small" style="background: #ef444420; color: #ef4444;" onclick="requestRevisionModal(${p.id})">🔄 Revise</button>
</div>
</div>`;
            }).join('')}
</div>` : ''}

        <!-- Ready for Delivery -->
<div class="form-section mb-24">
<div class="form-section-title">📤 Ready for Delivery</div>
            ${pendingDelivery.length === 0 ? '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 24px;">No orders pending delivery</p>' : pendingDelivery.map(order => {
                const client = clients.find(c => c.id === order.clientId) || { name: 'Unknown' };
                const orderProofs = proofs.filter(p => p.projectId === order.id);
                const approvedCount = orderProofs.filter(p => p.status === 'approved').length;
                const isPaid = checkClientPaymentStatus(order.clientId);
                return `
<div style="background: #1a1a1a; padding: 20px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
<div>
<div style="font-weight: 600; font-size: 16px;">${order.projectName || order.project}</div>
<div class="text-muted-sm">${client.name} • ${orderProofs.length} proofs (${approvedCount} approved)</div>
</div>
<div style="display: flex; gap: 8px; align-items: center;">
                            ${isPaid ? '<span style="background: #10b98120; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 12px;">💰 Paid</span>' : '<span style="background: #f59e0b20; color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-size: 12px;">⏳ Payment Pending</span>'}
<span class="order-status in_progress" style="font-size: 12px;">In Progress</span>
</div>
</div>
<div class="flex-gap-12">
<button class="btn-admin primary" onclick="markDelivered(${order.id})">📦 Mark Delivered & Notify Client</button>
<button class="btn-admin secondary" onclick="showAdminPanel('proofs')">✅ View Proofs</button>
</div>
</div>`;
            }).join('')}
</div>

        <!-- Activity Timeline -->
<div class="form-section">
<div class="form-section-title">📋 Recent Activity Timeline</div>
<div style="max-height: 400px; overflow-y: auto;">
                ${recentActivity.length === 0 ? '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 24px;">No activity yet</p>' : recentActivity.map(a => {
                    const icon = a.type === 'delivery' ? '📦' : a.status === 'approved' ? '✅' : a.status === 'revision' ? '🔄' : a.status === 'pending_admin' ? '📤' : a.status === 'pending' ? '⏳' : '📄';
                    const color = a.status === 'approved' ? '#10b981' : a.status === 'revision' ? '#ef4444' : a.status === 'delivered' ? '#8b5cf6' : a.status === 'pending_admin' ? '#f59e0b' : '#3b82f6';
                    return `
<div style="display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
<div class="fs-20">${icon}</div>
<div class="flex-1">
<div style="font-weight: 500;">${a.name} ${a.version ? '(v' + a.version + ')' : ''}</div>
<div class="text-muted-sm">${a.client}${a.designer ? ' • by ' + a.designer : ''}${a.project ? ' • ' + a.project : ''}</div>
</div>
<div class="text-right">
<span style="color: ${color}; font-size: 12px; font-weight: 600;">${(a.status || '').replace('_', ' ')}</span>
<div style="color: #666; font-size: 11px;">${a.date ? new Date(a.date).toLocaleDateString() : ''}</div>
</div>
</div>`;
                }).join('')}
</div>
</div>

        <!-- Delivered History -->
<div class="form-section mt-24">
<div class="form-section-title">✅ Delivered Projects</div>
            ${deliveredOrders.length === 0 ? '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 24px;">No deliveries yet</p>' : deliveredOrders.slice(0, 10).map(order => {
                const client = clients.find(c => c.id === order.clientId) || { name: 'Unknown' };
                return `
<div style="background: #1a1a1a; padding: 16px 20px; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #8b5cf6;">
<div>
<div class="fw-600">${order.projectName || order.project}</div>
<div class="text-muted-sm">${client.name}</div>
</div>
<div class="text-right">
<span style="color: #8b5cf6; font-size: 12px; font-weight: 600;">Delivered</span>
<div style="color: #666; font-size: 11px;">${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : ''}</div>
</div>
</div>`;
            }).join('')}
</div>
    `;
}

function showUploadDeliveryModal(orderId) {
    alert('Upload delivery files for order #' + orderId + ' (File upload interface would go here)');
}


