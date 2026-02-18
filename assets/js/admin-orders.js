function loadAdminOrdersPanel(searchTerm = '', statusFilter = 'all') {
    const designersList = JSON.parse(localStorage.getItem('nui_designers')) || [];

    let filtered = orders;
    if (searchTerm) {
        filtered = filtered.filter(o => {
            const client = clients.find(c => c.id === o.clientId);
            return (o.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (o.assignedDesigner || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                   String(o.id).includes(searchTerm);
        });
    }
    if (statusFilter !== 'all') {
        if (statusFilter === 'unassigned') {
            filtered = filtered.filter(o => !o.assignedDesigner && o.status !== 'delivered');
        } else {
            filtered = filtered.filter(o => o.status === statusFilter);
        }
    }

    const unassignedOrders = orders.filter(o => !o.assignedDesigner && o.status !== 'delivered').length;
    const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    document.getElementById('adminOrdersPanel').innerHTML = `
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
<h2 style="font-size: 28px; font-weight: 700;">📋 Order Tracking</h2>
<span style="color: #888;">${filtered.length} of ${orders.length} orders</span>
</div>

        <!-- Search, Filter, and Actions -->
<div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center;">
<input type="text" id="orderSearch" placeholder="Search by client, service, designer..." value="${searchTerm}"
                oninput="loadAdminOrdersPanel(this.value, document.getElementById('orderFilter').value)"
                style="flex: 1; min-width: 200px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 14px; background: #252525; color: #fff;">
<select id="orderFilter" onchange="loadAdminOrdersPanel(document.getElementById('orderSearch').value, this.value)" style="padding: 10px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #252525; color: #fff;">
<option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Orders</option>
<option value="unassigned" ${statusFilter === 'unassigned' ? 'selected' : ''}>Unassigned</option>
<option value="in_progress" ${statusFilter === 'in_progress' ? 'selected' : ''}>In Progress</option>
<option value="delivered" ${statusFilter === 'delivered' ? 'selected' : ''}>Completed</option>
</select>
<button onclick="exportOrdersCSV()" style="padding: 10px 16px; background: #333; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; color: #fff;">Export CSV</button>
<button onclick="showAdminPanel('neworder')" class="btn-cta">+ New Order</button>
</div>

        <!-- Order Stats -->
<div class="stat-cards" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 32px;">
<div class="stat-card"><div class="num">${orders.length}</div><div class="lbl">Total Orders</div></div>
<div class="stat-card" style="border-color: #f59e0b;"><div class="num" style="color: #f59e0b;">${unassignedOrders}</div><div class="lbl">Unassigned</div></div>
<div class="stat-card" style="border-color: var(--blue);"><div class="num" style="color: var(--blue);">${inProgressOrders}</div><div class="lbl">In Progress</div></div>
<div class="stat-card" style="border-color: var(--green);"><div class="num" style="color: var(--green);">${completedOrders}</div><div class="lbl">Completed</div></div>
</div>

        <!-- Unassigned Alert -->
        ${unassignedOrders > 0 ? `
<div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 16px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
<div style="display: flex; align-items: center; gap: 12px;">
<span style="font-size: 24px;">⚠️</span>
<div>
<strong style="color: #92400e;">${unassignedOrders} orders need designer assignment</strong>
<p style="font-size: 13px; color: #b45309; margin: 0;">Assign designers to start tracking progress</p>
</div>
</div>
<button onclick="showQuickAssignModal()" style="padding: 8px 16px; background: #d97706; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Quick Assign All</button>
</div>
        ` : ''}

        <!-- Orders List -->
<div id="ordersListContainer">
            ${filtered.length ? filtered.slice().reverse().map(o => renderOrderCardEnhanced(o, designersList)).join('') : '<p style="color: #888; text-align: center; padding: 40px;">No orders found.</p>'}
</div>
    `;
}

// Export orders to CSV
function exportOrdersCSV() {
    if (orders.length === 0) {
        alert('No orders to export.');
        return;
    }

    const headers = ['Order ID', 'Client', 'Service', 'Estimate', 'Status', 'Assigned Designer', 'Progress', 'Created Date'];
    const rows = orders.map(o => {
        const client = clients.find(c => c.id === o.clientId);
        return [
            o.id,
            client?.name || 'Unknown',
            o.service || '',
            o.estimate || 0,
            o.status || '',
            o.assignedDesigner || 'Unassigned',
            (o.progress || 0) + '%',
            o.createdAt || ''
        ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    downloadCSV(csv, 'nui-orders-' + new Date().toISOString().split('T')[0] + '.csv');
}

// Visual Timeline Component
function renderOrderTimeline(order) {
    const stages = [
        { id: 'received', label: 'Order Received', icon: '📥' },
        { id: 'assigned', label: 'Designer Assigned', icon: '👤' },
        { id: 'in_progress', label: 'In Progress', icon: '🎨' },
        { id: 'review', label: 'Under Review', icon: '👁️' },
        { id: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    // Determine current stage
    let currentStage = 0;
    if (order.createdAt) currentStage = 1;
    if (order.assignedDesigner || order.assignedDesignerId) currentStage = 2;
    if (order.status === 'in_progress') currentStage = 3;
    if (order.status === 'review') currentStage = 4;
    if (order.status === 'delivered') currentStage = 5;

    // Calculate turnaround progress
    const daysElapsed = order.createdAt ? Math.floor((new Date() - new Date(order.createdAt)) / (1000*60*60*24)) : 0;
    const turnaroundMin = order.turnaroundDaysMin || 7;
    const turnaroundMax = order.turnaroundDaysMax || turnaroundMin;
    const turnaroundPct = order.status === 'delivered' ? 100 : Math.min(100, Math.round((daysElapsed / turnaroundMax) * 100));
    const isOverdue = daysElapsed > turnaroundMax && order.status !== 'delivered';
    const isNearDue = daysElapsed >= turnaroundMin && daysElapsed <= turnaroundMax;

    return `
<div class="order-timeline" style="margin: 20px 0; padding: 16px; background: var(--admin-bg-secondary, #111); border-radius: 12px;">
            <!-- Turnaround Progress Bar -->
<div style="margin-bottom: 16px; padding: 12px 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
<span style="font-size: 12px; color: var(--admin-text-muted, #888);">Turnaround: <strong style="color: var(--admin-text, #fff);">${order.turnaround || turnaroundMin + ' days'}</strong></span>
<span style="font-size: 12px; color: ${isOverdue ? 'var(--red)' : isNearDue ? '#f59e0b' : 'var(--admin-text-muted, #888)'};">
                        ${order.status === 'delivered' ? '✅ Complete' : isOverdue ? '⚠️ Overdue by ' + (daysElapsed - turnaroundMax) + ' days' : 'Day ' + daysElapsed + ' of ' + turnaroundMax}
</span>
</div>
<div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
<div style="width: ${turnaroundPct}%; height: 100%; background: ${order.status === 'delivered' ? 'var(--green)' : isOverdue ? 'var(--red)' : isNearDue ? '#f59e0b' : 'var(--blue)'}; border-radius: 3px; transition: width 0.3s;"></div>
</div>
                ${order.packageName ? `<div style="font-size: 11px; color: var(--admin-text-muted, #666); margin-top: 6px;">📦 ${order.packageName}</div>` : ''}
</div>

            <!-- Stage Timeline -->
<div style="display: flex; justify-content: space-between; position: relative;">
                <!-- Connecting Line -->
<div style="position: absolute; top: 20px; left: 40px; right: 40px; height: 3px; background: var(--admin-border, rgba(255,255,255,0.1)); z-index: 0;"></div>
<div style="position: absolute; top: 20px; left: 40px; height: 3px; background: var(--red); z-index: 1; transition: width 0.3s; width: ${Math.max(0, (currentStage - 1) * 25)}%;"></div>

                ${stages.map((stage, i) => {
                    const isComplete = i < currentStage;
                    const isCurrent = i === currentStage - 1;
                    // Find timestamp from status history
                    const historyEntry = order.statusHistory?.find(h => h.status === stage.id);
                    const stageDate = historyEntry ? new Date(historyEntry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                    return `
<div style="display: flex; flex-direction: column; align-items: center; z-index: 2; flex: 1;">
<div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;
                                background: ${isComplete ? 'var(--red)' : isCurrent ? 'var(--admin-card, #1a1a1a)' : 'var(--admin-card, #1a1a1a)'};
                                border: 3px solid ${isComplete ? 'var(--red)' : isCurrent ? '#ff6b6b' : 'var(--admin-border, rgba(255,255,255,0.1))'};
                                ${isCurrent ? 'box-shadow: 0 0 12px rgba(255,0,0,0.4);' : ''}">
                                ${isComplete ? '✓' : stage.icon}
</div>
<span style="font-size: 11px; color: ${isComplete || isCurrent ? 'var(--admin-text, #fff)' : 'var(--admin-text-muted, #888)'}; margin-top: 8px; text-align: center; font-weight: ${isCurrent ? '600' : '400'};">${stage.label}</span>
                            ${stageDate ? `<span style="font-size: 10px; color: var(--admin-text-muted, #666); margin-top: 2px;">${stageDate}</span>` : ''}
</div>
                    `;
                }).join('')}
</div>
</div>
    `;
}

// Add status history entry
function addStatusHistory(order, status, note = '') {
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
        status: status,
        timestamp: new Date().toISOString(),
        note: note || getDefaultStatusNote(status),
        user: currentUser?.name || 'System'
    });
}

// Default status notes
function getDefaultStatusNote(status) {
    const notes = {
        'pending': 'Order created',
        'assigned': 'Designer assigned to project',
        'in_progress': 'Work started on project',
        'review': 'Submitted for client review',
        'delivered': 'Project completed and delivered'
    };
    return notes[status] || 'Status updated';
}

// Render status history
function renderStatusHistory(order) {
    if (!order.statusHistory || order.statusHistory.length === 0) {
        return '<p style="color: var(--admin-text-muted, #888); font-size: 13px;">No status history available</p>';
    }

    return order.statusHistory.map(entry => `
<div style="display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--admin-border, rgba(255,255,255,0.1));">
<div style="width: 8px; height: 8px; background: var(--red); border-radius: 50%; margin-top: 6px;"></div>
<div style="flex: 1;">
<div style="font-weight: 600; color: var(--admin-text, #fff); text-transform: capitalize;">${entry.status.replace('_', ' ')}</div>
<div style="font-size: 13px; color: var(--admin-text-muted, #888);">${entry.note}</div>
<div style="font-size: 11px; color: var(--admin-text-muted, #666); margin-top: 4px;">
                    ${new Date(entry.timestamp).toLocaleString()} • ${entry.user}
</div>
</div>
</div>
    `).join('');
}

// Due date warning helper
function getDueDateWarning(dueDate) {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000*60*60*24));
    if (days < 0) return { type: 'overdue', label: `OVERDUE by ${Math.abs(days)} days`, color: 'var(--red)' };
    if (days <= 2) return { type: 'urgent', label: `DUE SOON (${days}d)`, color: '#f59e0b' };
    if (days <= 7) return { type: 'upcoming', label: `Coming up (${days}d)`, color: '#3b82f6' };
    return null;
}

function renderOrderCardEnhanced(o, designers) {
    const client = clients.find(c => c.id === o.clientId);
    const progress = o.status === 'delivered' ? 100 : o.status === 'in_progress' ? 60 : o.status === 'pending' ? 20 : 40;
    const daysLeft = Math.ceil((new Date(o.dueDate) - new Date()) / (1000*60*60*24));
    const designerRaw = o.assignedDesigner || null;
    const designer = typeof designerRaw === 'object' ? (designerRaw?.name || null) : designerRaw;

    return `
 <div class="order-card" style="margin-bottom: 16px; position: relative; overflow: hidden;">
        ${!designer ? '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #f59e0b;"></div>' : ''}
<div class="order-header" style="display: flex; justify-content: space-between; align-items: start;">
<div style="flex: 1;">
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
<div class="order-title" style="font-size: 18px;">${o.projectName}</div>
<span class="order-status ${o.status}" style="text-transform: capitalize;">${o.status.replace('_', ' ')}</span>
</div>
<div class="order-client" style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
<span>👤 ${client ? client.name : 'Unknown Client'}</span>
<span style="color: #888;">|</span>
<span style="color: ${daysLeft < 0 ? 'var(--red)' : daysLeft < 3 ? '#f59e0b' : '#888'};">
                        📅 ${daysLeft < 0 ? 'Overdue by ' + Math.abs(daysLeft) + ' days' : daysLeft + ' days left'}
</span>
<span style="color: #888;">|</span>
<span style="color: var(--green); font-weight: 600;">💰 $${o.estimate?.toLocaleString() || 0}</span>
</div>
</div>
<div style="text-align: right;">
                ${designer ? `
<div style="display: flex; align-items: center; gap: 8px; background: #f0fdf4; padding: 8px 12px; border-radius: 8px;">
<span style="width: 32px; height: 32px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">${String(designer).charAt(0)}</span>
<div>
<div style="font-weight: 600; font-size: 14px;">${designer}</div>
<div style="font-size: 11px; color: #059669;">Assigned</div>
</div>
</div>
                ` : `
<select onchange="assignDesignerToOrder(${o.id}, this.value)" style="padding: 10px 16px; border: 2px solid #f59e0b; border-radius: 8px; background: #fffbeb; font-weight: 600; cursor: pointer;">
<option value="">⚠️ Assign Designer</option>
                        ${designers.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
</select>
                `}
</div>
</div>

        <!-- Progress Section -->
<div style="margin: 16px 0;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
<span style="font-size: 13px; color: #666;">Progress</span>
<span style="font-size: 13px; font-weight: 600;">${progress}%</span>
</div>
<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%; background: ${o.status === 'delivered' ? 'var(--green)' : o.status === 'in_progress' ? 'var(--blue)' : '#f59e0b'}"></div></div>
</div>

        <!-- Visual Order Timeline -->
        ${renderOrderTimeline(o)}

        <!-- Due Date Warning -->
        ${(() => {
            const warning = getDueDateWarning(o.dueDate);
            return warning ? `<div style="display: inline-block; padding: 6px 14px; background: ${warning.color}20; border: 1px solid ${warning.color}40; color: ${warning.color}; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">⏰ ${warning.label}</div>` : '';
        })()}

        <!-- Actions -->
<div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
<button onclick="viewOrderDetails(${o.id})" class="btn-outline" style="padding: 8px 16px;">View Details</button>
<button onclick="showInvoice(${o.id})" style="padding: 8px 16px; background: #f5f5f5; border: none; border-radius: 6px; cursor: pointer;">Invoice</button>
            ${o.status !== 'delivered' ? `
<button onclick="updateOrderStatus(${o.id})" style="padding: 8px 16px; background: var(--blue); color: #fff; border: none; border-radius: 6px; cursor: pointer;">Update Status</button>
<button onclick="markDelivered(${o.id})" style="padding: 8px 16px; background: var(--green); color: #fff; border: none; border-radius: 6px; cursor: pointer;">✓ Mark Delivered</button>
            ` : `
<span style="padding: 8px 16px; background: #d1fae5; color: #059669; border-radius: 6px;">✓ Completed ${o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : ''}</span>
            `}
</div>
 </div>`;
}

async function assignDesignerToOrder(orderId, designerName) {
    const order = orders.find(o => o.id === orderId);
    if (order && designerName) {
        // Store both name and ID for proper designer dashboard matching
        const allDesigners = JSON.parse(localStorage.getItem('nui_designers')) || [];
        const designer = allDesigners.find(d => d.name === designerName);
        order.assignedDesigner = designerName;
        order.assignedDesignerId = designer?.id || designerName; // ID for dashboard filtering
        order.assignedAt = new Date().toISOString();
        addStatusHistory(order, 'assigned', `Assigned to ${designerName}`);
        if (order.status === 'pending') {
            order.status = 'in_progress';
            addStatusHistory(order, 'in_progress', 'Work started');
        }
        saveOrders();

        // Notify the assigned designer via messaging
        addDesignerMessage(designer?.id || designerName, order.id, `📁 You've been assigned to "${order.projectName}" — Due: ${new Date(order.dueDate).toLocaleDateString()}`, 'system', true);

        // Notify client that work has started
        const client = clients.find(c => c.id === order.clientId);
        if (client?.email) {
            try {
                await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: client.email,
                        clientId: client.id,
                        subject: `🎨 Your ${order.projectName} is Now In Progress!`,
                        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #3b82f6, #60a5fa); padding: 32px; text-align: center;">
<h2 style="margin: 0; font-size: 24px; color: #fff;">Work Has Begun! 🎨</h2>
</div>
<div style="padding: 32px;">
<p style="color: #ccc; font-size: 16px;">Hey ${client.name},</p>
<p style="color: #ccc; font-size: 16px;">Great news — a designer has been assigned to your <strong>${order.projectName}</strong> project and work is officially underway!</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
<p style="color: #3b82f6; font-weight: 600; margin-bottom: 12px;">📋 Project Details:</p>
<p style="color: #ccc;">Designer: <strong>${designerName}</strong></p>
<p style="color: #ccc;">Turnaround: <strong>${order.turnaround}</strong></p>
<p style="color: #ccc;">Due Date: <strong>${new Date(order.dueDate).toLocaleDateString()}</strong></p>
</div>
<p style="color: #888; font-size: 14px;">You'll receive updates as work progresses. Check your <a href="https://newurbaninfluence.com/#portal" style="color: #e63946;">Client Portal</a> anytime for the latest status.</p>
</div>
<div style="background: #050505; padding: 20px; text-align: center; border-top: 1px solid #222;">
<p style="color: #666; font-size: 12px; margin: 0;">New Urban Influence • Detroit, MI</p>
</div>
</div>`,
                        text: `Your project "${order.projectName}" is now in progress! Designer ${designerName} has been assigned. Turnaround: ${order.turnaround}.`
                    })
                });
            } catch (err) { console.log('Assignment email failed:', err.message); }
        }

        // Log to CRM
        logProofActivity('assigned', { clientId: order.clientId, projectName: order.projectName }, `Designer ${designerName} assigned to "${order.projectName}"`);

        loadAdminOrdersPanel();
    }
}

function showQuickAssignModal() {
    const designers = JSON.parse(localStorage.getItem('nui_designers')) || [];
    const unassignedOrders = orders.filter(o => !o.assignedDesigner && o.status !== 'delivered');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'quickAssignModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 600px;">
<div class="modal-header">
<h3 class="modal-title">Quick Assign Designers</h3>
<button class="modal-close" onclick="document.getElementById('quickAssignModal').remove()">×</button>
</div>
<div class="modal-body">
                ${unassignedOrders.map(o => `
<div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 12px;">
<div>
<div style="font-weight: 600;">${o.projectName}</div>
<div style="font-size: 13px; color: #888;">${clients.find(c => c.id === o.clientId)?.name || 'Unknown'}</div>
</div>
<select id="assign_${o.id}" style="padding: 8px 12px; border: 1px solid #e5e5e5; border-radius: 6px;">
<option value="">Select Designer</option>
                            ${designers.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
</select>
</div>
                `).join('')}
<button onclick="applyQuickAssignments()" class="btn-cta" style="width: 100%; margin-top: 16px;">Assign All Selected</button>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function applyQuickAssignments() {
    const allDesigners = JSON.parse(localStorage.getItem('nui_designers')) || [];
    const unassignedOrders = orders.filter(o => !o.assignedDesigner && o.status !== 'delivered');
    let assignedCount = 0;

    unassignedOrders.forEach(o => {
        const select = document.getElementById('assign_' + o.id);
        if (select && select.value) {
            const designer = allDesigners.find(d => d.name === select.value);
            o.assignedDesigner = select.value;
            o.assignedDesignerId = designer?.id || select.value;
            o.assignedAt = new Date().toISOString();
            addStatusHistory(o, 'assigned', `Assigned to ${select.value}`);
            if (o.status === 'pending') {
                o.status = 'in_progress';
                addStatusHistory(o, 'in_progress', 'Work started');
            }
            // Notify designer
            addDesignerMessage(designer?.id || select.value, o.id, `📁 You've been assigned to "${o.projectName}" — Due: ${new Date(o.dueDate).toLocaleDateString()}`, 'system', true);
            assignedCount++;
        }
    });

    saveOrders();
    document.getElementById('quickAssignModal').remove();
    loadAdminOrdersPanel();
    alert('Successfully assigned ' + assignedCount + ' orders!');
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const client = clients.find(c => c.id === order.clientId);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'orderDetailsModal';
    modal.innerHTML = `
<div class="modal" style="max-width: 700px;">
<div class="modal-header">
<h3 class="modal-title">Order Details: ${order.projectName}</h3>
<button class="modal-close" onclick="document.getElementById('orderDetailsModal').remove()">×</button>
</div>
<div class="modal-body">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
<div>
<h4 style="font-size: 12px; color: #888; margin-bottom: 8px;">CLIENT</h4>
<p style="font-weight: 600;">${client?.name || 'Unknown'}</p>
<p style="font-size: 14px; color: #666;">${client?.email || ''}</p>
</div>
<div>
<h4 style="font-size: 12px; color: #888; margin-bottom: 8px;">DESIGNER</h4>
<p style="font-weight: 600;">${order.assignedDesigner || 'Not Assigned'}</p>
                        ${order.assignedAt ? `<p style="font-size: 14px; color: #666;">Assigned: ${new Date(order.assignedAt).toLocaleDateString()}</p>` : ''}
</div>
</div>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
<div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
<div style="font-size: 24px; font-weight: 700;">$${order.estimate?.toLocaleString() || 0}</div>
<div style="font-size: 12px; color: #888;">Estimate</div>
</div>
<div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
<div style="font-size: 24px; font-weight: 700;">${order.turnaround || 'N/A'}</div>
<div style="font-size: 12px; color: #888;">Turnaround</div>
</div>
<div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
<div style="font-size: 24px; font-weight: 700;">${new Date(order.dueDate).toLocaleDateString()}</div>
<div style="font-size: 12px; color: #888;">Due Date</div>
</div>
<div style="padding: 16px; background: ${order.status === 'delivered' ? '#d1fae5' : '#fef3c7'}; border-radius: 8px; text-align: center;">
<div style="font-size: 24px; font-weight: 700; text-transform: capitalize;">${order.status.replace('_', ' ')}</div>
<div style="font-size: 12px; color: #888;">Status</div>
</div>
</div>
                ${order.description ? `<div style="margin-bottom: 24px;"><h4 style="font-size: 12px; color: #888; margin-bottom: 8px;">DESCRIPTION</h4><p>${order.description}</p></div>` : ''}

                <!-- Visual Timeline -->
<div style="margin-bottom: 24px;">
<h4 style="font-size: 12px; color: #888; margin-bottom: 12px;">ORDER PROGRESS</h4>
                    ${renderOrderTimeline(order)}
</div>

                <!-- Status History -->
<div style="margin-bottom: 24px;">
<h4 style="font-size: 12px; color: #888; margin-bottom: 12px;">STATUS HISTORY</h4>
<div style="background: #f8fafc; border-radius: 12px; padding: 16px; max-height: 200px; overflow-y: auto;">
                        ${renderStatusHistory(order)}
</div>
</div>

<div style="display: flex; gap: 12px;">
<button onclick="document.getElementById('orderDetailsModal').remove(); showInvoice(${order.id});" class="btn-cta">View Invoice</button>
<button onclick="document.getElementById('orderDetailsModal').remove(); updateOrderStatus(${order.id});" class="btn-outline">Update Status</button>
<button onclick="document.getElementById('orderDetailsModal').remove();" style="padding: 10px 20px; background: #f5f5f5; border: none; border-radius: 8px; cursor: pointer;">Close</button>
</div>
</div>
</div>
    `;
    document.body.appendChild(modal);
}

function filterOrders(filter) {
    const containers = document.getElementById('ordersListContainer');
    const designers = JSON.parse(localStorage.getItem('nui_designers')) || [];
    let filteredOrders = orders;

    if (filter === 'unassigned') {
        filteredOrders = orders.filter(o => !o.assignedDesigner && o.status !== 'delivered');
    } else if (filter === 'in_progress') {
        filteredOrders = orders.filter(o => o.status === 'in_progress');
    } else if (filter === 'delivered') {
        filteredOrders = orders.filter(o => o.status === 'delivered');
    }

    containers.innerHTML = filteredOrders.length ?
        filteredOrders.slice().reverse().map(o => renderOrderCardEnhanced(o, designers)).join('') :
        '<p style="color: #888; text-align: center; padding: 40px;">No orders match this filter.</p>';
}

