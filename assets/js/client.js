function loadClientDashboard() {
    if (!currentUser || currentUser.type !== 'client') return;

    const client = clients.find(c => c.id === currentUser.clientId);
    if (!client) { portalLogout(); return; }

    const myOrders = orders.filter(o => o.clientId === client.id);
    const myInvoices = invoices.filter(i => i.clientId === client.id);
    const unpaidInvoices = myInvoices.filter(i => i.status !== 'paid');
    const myMsgs = (typeof clientMessages !== 'undefined') ? clientMessages.filter(m => m.clientId === client.id) : [];
    const unreadMsgs = myMsgs.filter(m => !m.read && m.fromAdmin);
    const activeOrders = myOrders.filter(o => o.status !== 'delivered');
    const totalOwed = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    document.getElementById('clientPortal').style.display = 'block';
    document.getElementById('clientPortalContent').innerHTML = `
<div style="max-width: 1200px; margin: 0 auto; padding: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
<div>
<h2 style="font-size: 32px; font-weight: 700;">Welcome back, ${client.name}</h2>
<p style="color: #888;">Manage your projects, invoices, and brand assets</p>
</div>
<button onclick="portalLogout()" style="padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer;">Sign Out</button>
</div>

            <!-- Stats Row -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
<div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #222;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Active Projects</div>
<div style="font-size: 32px; font-weight: 700; color: #3b82f6; margin-top: 4px;">${activeOrders.length}</div>
</div>
<div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #222;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Orders</div>
<div style="font-size: 32px; font-weight: 700; color: #fff; margin-top: 4px;">${myOrders.length}</div>
</div>
<div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #222;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Outstanding Balance</div>
<div style="font-size: 32px; font-weight: 700; color: ${totalOwed > 0 ? '#ef4444' : '#10b981'}; margin-top: 4px;">$${totalOwed.toLocaleString()}</div>
</div>
<div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #222;">
<div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Messages</div>
<div style="font-size: 32px; font-weight: 700; color: ${unreadMsgs.length > 0 ? '#f59e0b' : '#fff'}; margin-top: 4px;">${unreadMsgs.length > 0 ? unreadMsgs.length + ' new' : myMsgs.length}</div>
</div>
</div>

            <!-- Quick Actions -->
<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px;">
<button onclick="showClientNewOrder()" style="padding: 24px; background: linear-gradient(135deg, var(--red), #ff6b6b); color: #fff; border: none; border-radius: 12px; cursor: pointer; text-align: left;">
<div style="font-size: 24px; margin-bottom: 8px;">➕</div>
<div style="font-weight: 600;">New Order</div>
</button>
<button onclick="showClientInvoices()" style="padding: 24px; background: #111; border: 1px solid #333; color: #fff; border-radius: 12px; cursor: pointer; text-align: left;">
<div style="font-size: 24px; margin-bottom: 8px;">📄</div>
<div style="font-weight: 600;">Invoices ${unpaidInvoices.length > 0 ? '<span style="color: #ef4444;">(' + unpaidInvoices.length + ')</span>' : ''}</div>
</button>
<button onclick="loadClientMessagesPanel()" style="padding: 24px; background: #111; border: 1px solid ${unreadMsgs.length > 0 ? '#f59e0b' : '#333'}; color: #fff; border-radius: 12px; cursor: pointer; text-align: left; position: relative;">
<div style="font-size: 24px; margin-bottom: 8px;">💬</div>
<div style="font-weight: 600;">Messages</div>
                    ${unreadMsgs.length > 0 ? '<div style="position: absolute; top: 12px; right: 12px; width: 22px; height: 22px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #000;">' + unreadMsgs.length + '</div>' : ''}
</button>
<button onclick="showClientPortal(client)" style="padding: 24px; background: #111; border: 1px solid #333; color: #fff; border-radius: 12px; cursor: pointer; text-align: left;">
<div style="font-size: 24px; margin-bottom: 8px;">🎨</div>
<div style="font-weight: 600;">Brand Portal</div>
</button>
<button onclick="openMeetingModal()" style="padding: 24px; background: #111; border: 1px solid #333; color: #fff; border-radius: 12px; cursor: pointer; text-align: left;">
<div style="font-size: 24px; margin-bottom: 8px;">📅</div>
<div style="font-weight: 600;">Book Meeting</div>
</button>
</div>

            <!-- Subscription Plans Section -->
            ${(() => {
                const clientSubs = subscriptions.filter(s => s.clientId === client.id && s.status === 'active');
                if (clientSubs.length === 0) return '';
                const sub = clientSubs[0];
                const plan = subscriptionPlans.find(p => p.id === sub.planId);
                const nextBillingDate = new Date(sub.nextBillingDate);
                const daysUntilBilling = Math.ceil((nextBillingDate - new Date()) / (1000 * 60 * 60 * 24));
                const activeOrders = myOrders.filter(o => !['delivered', 'completed', 'cancelled'].includes(o.status));
                const progressPercent = plan.orderLimit ? Math.min(100, (activeOrders.length / plan.orderLimit) * 100) : 0;
                return `
<div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid #e63946; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
<div>
<h2 style="font-size: 20px; margin: 0; color: #fff;">Your Plan</h2>
<p style="color: #888; font-size: 13px; margin-top: 4px;">Subscription Management</p>
</div>
<div style="text-align: right;">
<div style="font-size: 28px; font-weight: 700; color: #e63946;">$${plan.price}</div>
<div style="color: #888; font-size: 12px;">per month</div>
</div>
</div>
<div style="background: #111; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
<span style="font-weight: 600; color: #fff;">${plan.name}</span>
<span style="padding: 4px 12px; background: #10b981; color: #000; border-radius: 100px; font-size: 11px; font-weight: 600;">✓ Active</span>
</div>
<div style="font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                            ${plan.features.slice(0, 3).map(f => '• ' + f).join('<br>')}
                            ${plan.features.length > 3 ? '<br>+ ' + (plan.features.length - 3) + ' more features' : ''}
</div>
                        ${plan.orderLimit ? `
<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #222;">
<div style="font-size: 12px; color: #888; margin-bottom: 8px;">Active Orders: ${activeOrders.length} / ${plan.orderLimit}</div>
<div style="height: 4px; background: #222; border-radius: 2px; overflow: hidden;">
<div style="width: ${progressPercent}%; height: 100%; background: #e63946; border-radius: 2px;"></div>
</div>
</div>
                        ` : ''}
</div>
<div style="display: flex; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.6);">
<span>📅 Next billing:</span>
<span>${nextBillingDate.toLocaleDateString()} (in ${daysUntilBilling} days)</span>
</div>
</div>
                `;
            })()}

            <!-- My Active Projects (expanded cards) -->
<div style="background: #111; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
<h2 style="font-size: 20px; margin: 0;">My Projects</h2>
<span style="color: #888; font-size: 13px;">${activeOrders.length} active, ${myOrders.filter(o => o.status === 'delivered').length} completed</span>
</div>
                ${myOrders.length > 0 ? myOrders.slice().reverse().slice(0, 8).map(o => {
                    const daysElapsed = o.createdAt ? Math.floor((new Date() - new Date(o.createdAt)) / (1000*60*60*24)) : 0;
                    const turnaroundMin = o.turnaroundDaysMin || 7;
                    const turnaroundMax = o.turnaroundDaysMax || 14;
                    const isOverdue = daysElapsed > turnaroundMax && o.status !== 'delivered';
                    const isNearDue = daysElapsed >= turnaroundMin && daysElapsed <= turnaroundMax && o.status !== 'delivered';
                    const progressPct = o.status === 'delivered' ? 100 : o.status === 'review' ? 80 : o.status === 'in_progress' ? 50 : o.status === 'assigned' ? 25 : 10;
                    const myInvoice = invoices.find(i => i.orderId === o.id);
                    const designerName = o.assignedDesigner || null;
                    const statusColors = { pending: '#f59e0b', assigned: '#6366f1', in_progress: '#3b82f6', review: '#8b5cf6', delivered: '#10b981' };
                    const statusIcons = { pending: '📥', assigned: '👤', in_progress: '🎨', review: '👁️', delivered: '✅' };
                    const statusLabel = (o.status || 'pending').replace('_', ' ');
                    return `
<div style="padding: 20px; background: #0a0a0a; border: 1px solid #222; border-radius: 12px; margin-bottom: 12px;">
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
<div>
<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${o.projectName}</div>
<div style="color: #888; font-size: 13px;">${o.packageName || 'Custom'} • Created ${new Date(o.createdAt).toLocaleDateString()}</div>
</div>
<span style="padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${(statusColors[o.status] || '#f59e0b')}20; color: ${statusColors[o.status] || '#f59e0b'};">${statusIcons[o.status] || '📥'} ${statusLabel}</span>
</div>
                        <!-- Turnaround Progress -->
<div style="margin-bottom: 12px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
<span style="font-size: 12px; color: #888;">Turnaround Progress</span>
<span style="font-size: 12px; font-weight: 600; color: ${o.status === 'delivered' ? '#10b981' : isOverdue ? '#ef4444' : isNearDue ? '#f59e0b' : '#3b82f6'};">${o.status === 'delivered' ? 'Delivered!' : isOverdue ? 'Overdue (' + daysElapsed + ' days)' : 'Day ' + daysElapsed + ' of ' + turnaroundMin + '-' + turnaroundMax}</span>
</div>
<div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
<div style="width: ${progressPct}%; height: 100%; background: ${o.status === 'delivered' ? '#10b981' : isOverdue ? '#ef4444' : isNearDue ? '#f59e0b' : '#3b82f6'}; border-radius: 3px; transition: width 0.3s;"></div>
</div>
</div>
                        <!-- Designer + Payment Row -->
<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
<div style="display: flex; gap: 16px; align-items: center;">
                                ${designerName ? '<div style="display: flex; align-items: center; gap: 8px;"><div style="width: 28px; height: 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">' + (designerName.charAt(0) || 'D').toUpperCase() + '</div><div><div style="font-size: 13px; font-weight: 500;">' + designerName + '</div><div style="font-size: 11px; color: #888;">Your Designer</div></div></div>' : '<div style="font-size: 13px; color: #666;">Awaiting designer assignment</div>'}
                                ${o.turnaround ? '<div style="font-size: 12px; color: #888; padding: 4px 10px; background: #1a1a1a; border-radius: 6px;">⏱️ ' + o.turnaround + '</div>' : ''}
</div>
<div style="display: flex; gap: 8px; align-items: center;">
                                ${myInvoice ? (myInvoice.status === 'paid' ? '<span style="font-size: 12px; color: #10b981; font-weight: 600;">Paid</span>' : '<button onclick="payInvoice(' + myInvoice.id + ')" style="padding: 8px 20px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">Pay $' + (myInvoice.total || 0).toLocaleString() + '</button>') : ''}
</div>
</div>
</div>`;
                }).join('') : '<div style="text-align: center; padding: 40px; color: #888;"><div style="font-size: 48px; margin-bottom: 16px;">🎨</div><p>No projects yet. Start your first one!</p><button onclick="showClientNewOrder()" style="margin-top: 12px; padding: 12px 28px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Start a Project →</button></div>'}
</div>

            <!-- Two-column: Invoices + Messages Preview -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <!-- Invoices -->
<div style="background: #111; border-radius: 16px; padding: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<h2 style="font-size: 18px; margin: 0;">Invoices</h2>
<button onclick="showClientInvoices()" style="font-size: 13px; color: #dc2626; background: none; border: none; cursor: pointer;">View All →</button>
</div>
                    ${myInvoices.length > 0 ? myInvoices.slice(0, 4).map(i => `
<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1a1a1a;">
<div>
<div style="font-weight: 500; font-size: 14px;">${i.invoiceNumber || 'INV-' + i.id}</div>
<div style="color: #888; font-size: 12px;">$${(i.total || 0).toLocaleString()} ${i.type === 'estimate' ? '(Estimate)' : ''}</div>
</div>
<div style="display: flex; gap: 8px; align-items: center;">
<span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; background: ${i.status === 'paid' ? '#10b98120' : i.status === 'estimate' ? '#6366f120' : '#ef444420'}; color: ${i.status === 'paid' ? '#10b981' : i.status === 'estimate' ? '#6366f1' : '#ef4444'};">${i.status}</span>
                                ${i.status !== 'paid' && i.status !== 'estimate' ? '<button onclick="payInvoice(' + i.id + ')" style="padding: 6px 12px; background: #10b981; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Pay</button>' : ''}
</div>
</div>
                    `).join('') : '<p style="color: #666; font-size: 14px;">No invoices yet.</p>'}
</div>

                <!-- Messages Preview -->
<div style="background: #111; border-radius: 16px; padding: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
<h2 style="font-size: 18px; margin: 0;">Messages ${unreadMsgs.length > 0 ? '<span style="color: #f59e0b; font-size: 14px;">(' + unreadMsgs.length + ' new)</span>' : ''}</h2>
<button onclick="loadClientMessagesPanel()" style="font-size: 13px; color: #dc2626; background: none; border: none; cursor: pointer;">Open Chat →</button>
</div>
                    ${myMsgs.length > 0 ? myMsgs.slice(0, 3).map(m => `
<div style="padding: 12px; background: ${m.fromAdmin ? '#0a1628' : '#0a0a0a'}; border: 1px solid ${m.fromAdmin ? '#1e3a5f' : '#222'}; border-radius: 8px; margin-bottom: 8px;">
<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
<span style="font-size: 12px; font-weight: 600; color: ${m.fromAdmin ? '#3b82f6' : '#10b981'};">${m.fromAdmin ? 'NUI Team' : 'You'}</span>
<span style="font-size: 11px; color: #555;">${new Date(m.createdAt).toLocaleDateString()}</span>
</div>
<p style="margin: 0; font-size: 13px; color: #bbb; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${m.message}</p>
</div>
                    `).join('') : '<div style="text-align: center; padding: 24px; color: #666;"><div style="font-size: 32px; margin-bottom: 8px;">💬</div><p style="font-size: 13px;">No messages yet</p><button onclick="loadClientMessagesPanel()" style="margin-top: 8px; padding: 8px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">Send a Message</button></div>'}
</div>
</div>

            <!-- My Info -->
<div style="background: #111; border-radius: 16px; padding: 24px;">
<h2 style="font-size: 18px; margin-bottom: 16px;">My Information</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Business Name</div><div>${client.name}</div></div>
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Contact</div><div>${client.contact || client.name}</div></div>
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Email</div><div>${client.email}</div></div>
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Phone</div><div>${client.phone || 'Not set'}</div></div>
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Industry</div><div>${client.industry || 'Not set'}</div></div>
<div><div style="color: #888; font-size: 12px; margin-bottom: 4px;">Website</div><div>${client.website ? '<a href="' + client.website + '" target="_blank" style="color: #3b82f6;">' + client.website + '</a>' : 'Not set'}</div></div>
</div>
</div>
</div>
    `;
}

function showClientNewOrder() {
    const client = clients.find(c => c.id === currentUser.clientId);
    if (!client) return;

    document.getElementById('clientPortalContent').innerHTML = `
<div style="max-width: 800px; margin: 0 auto; padding: 24px;">
<button onclick="loadClientDashboard()" style="margin-bottom: 24px; padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer;">← Back to Dashboard</button>
<h2 style="font-size: 28px; margin-bottom: 8px;">Start a New Project</h2>
<p style="color: #888; margin-bottom: 32px;">Select a service package or request a custom quote</p>

            <!-- Service Packages -->
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px;">
                ${servicePackages.map(pkg => `
<div onclick="selectClientPackage('${pkg.id}')" id="clientPkg-${pkg.id}" style="padding: 24px; background: #111; border: 2px solid #333; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
<div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${pkg.name}</div>
<div style="font-size: 24px; font-weight: 700; color: var(--red); margin-bottom: 8px;">${pkg.price > 0 ? '$' + pkg.price.toLocaleString() : 'Custom'}</div>
<div style="font-size: 13px; color: #888; margin-bottom: 4px;">⏱️ ${pkg.turnaround}</div>
<div style="font-size: 13px; color: #666;">${pkg.desc}</div>
</div>
                `).join('')}
</div>

            <!-- Request Form -->
<form onsubmit="submitClientOrder(event)" style="background: #111; padding: 32px; border-radius: 16px; border: 1px solid #333;">
<h2 style="font-size: 20px; margin-bottom: 20px;">Project Details</h2>
<input type="hidden" id="clientSelectedPackage" value="">
<div style="margin-bottom: 16px;">
<label style="display: block; color: #888; font-size: 13px; margin-bottom: 6px;">Project Name *</label>
<input type="text" id="clientProjectName" required style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-family: inherit;">
</div>
<div style="margin-bottom: 16px;">
<label style="display: block; color: #888; font-size: 13px; margin-bottom: 6px;">Description / Notes</label>
<textarea id="clientProjectDesc" rows="3" style="width: 100%; padding: 12px; background: #1a1a1a; border: 1px solid #333; color: #fff; border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
<div>
<label style="display: block; color: #888; font-size: 13px; margin-bottom: 6px;">Selected Package</label>
<div id="clientPackageDisplay" style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #888;">None selected — choose above</div>
</div>
<div>
<label style="display: block; color: #888; font-size: 13px; margin-bottom: 6px;">Estimated Total</label>
<div id="clientPriceDisplay" style="padding: 12px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: var(--red); font-weight: 700; font-size: 18px;">—</div>
</div>
</div>
<button type="submit" style="width: 100%; padding: 16px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; font-family: inherit;">Submit Order Request</button>
<p style="color: #666; font-size: 12px; text-align: center; margin-top: 12px;">You'll receive an invoice via email after we confirm your project details.</p>
</form>
</div>
    `;
}

function selectClientPackage(pkgId) {
    document.querySelectorAll('[id^="clientPkg-"]').forEach(el => el.style.borderColor = '#333');
    const el = document.getElementById('clientPkg-' + pkgId);
    if (el) el.style.borderColor = 'var(--red)';

    const pkg = servicePackages.find(p => p.id === pkgId);
    document.getElementById('clientSelectedPackage').value = pkgId;
    if (pkg) {
        document.getElementById('clientPackageDisplay').innerHTML = `<span style="color: #fff;">${pkg.name}</span> <span style="color: #888;">• ${pkg.turnaround}</span>`;
        document.getElementById('clientPriceDisplay').textContent = pkg.price > 0 ? '$' + pkg.price.toLocaleString() : 'Custom Quote';
        if (!document.getElementById('clientProjectName').value) {
            document.getElementById('clientProjectName').value = pkg.name;
        }
    }
}

async function submitClientOrder(e) {
    e.preventDefault();
    const client = clients.find(c => c.id === currentUser.clientId);
    if (!client) return;

    const pkgId = document.getElementById('clientSelectedPackage').value;
    const pkg = servicePackages.find(p => p.id === pkgId);

    const order = {
        id: Date.now(),
        clientId: client.id,
        projectName: document.getElementById('clientProjectName').value,
        description: document.getElementById('clientProjectDesc').value,
        estimate: pkg?.price || 0,
        turnaround: pkg?.turnaround || 'TBD',
        turnaroundDaysMin: pkg ? parseInt(pkg.turnaround) || 7 : 7,
        turnaroundDaysMax: pkg ? (parseInt(pkg.turnaround.match(/\d+\s*[-–]\s*(\d+)/)?.[1]) || parseInt(pkg.turnaround) || 14) : 14,
        packageId: pkgId || 'custom',
        packageName: pkg?.name || 'Custom Request',
        dueDate: new Date(Date.now() + (pkg ? (parseInt(pkg.turnaround.match(/(\d+)\s*[-–]\s*(\d+)/)?.[2] || pkg.turnaround) || 14) : 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order submitted by client', user: client.name }],
        createdAt: new Date().toISOString(),
        deliveredAt: null,
        deliverables: [],
        paymentStatus: 'unpaid',
        submittedByClient: true
    };
    orders.push(order);
    saveOrders();

    // Create invoice
    const invoice = {
        id: Date.now() + 1,
        invoiceNumber: 'INV-' + order.id,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        orderId: order.id,
        projectName: order.projectName,
        lineItems: [{ description: order.projectName, amount: order.estimate }],
        subtotal: order.estimate,
        total: order.estimate,
        dueDate: order.dueDate,
        status: order.estimate > 0 ? 'pending' : 'quote_requested',
        createdAt: new Date().toISOString()
    };
    invoices.push(invoice);
    saveInvoices();

    // Notify admin
    try {
        await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'newurbaninfluence@gmail.com',
                subject: `🆕 New Order from ${client.name}: ${order.projectName}`,
                html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; border-radius: 12px; overflow: hidden;">
<div style="background: var(--red, #e11d48); padding: 32px; text-align: center;"><h2 style="margin: 0; color: #fff;">New Client Order!</h2></div>
<div style="padding: 32px;">
<p style="color: #ccc;">Client <strong>${client.name}</strong> submitted a new order:</p>
<div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 16px 0;">
<p style="color: #fff;"><strong>${order.projectName}</strong></p>
<p style="color: #888;">Package: ${order.packageName}</p>
<p style="color: #888;">Amount: <strong style="color: var(--red, #e11d48);">$${order.estimate.toLocaleString()}</strong></p>
                            ${order.description ? '<p style="color: #888;">Notes: ' + order.description + '</p>' : ''}
</div>
<p style="color: #888; font-size: 13px;">Log in to the admin dashboard to assign a designer.</p>
</div>
</div>`,
                text: `New order from ${client.name}: ${order.projectName} — $${order.estimate.toLocaleString()}`
            })
        });
    } catch (err) { console.log('Admin notification failed:', err.message); }

    // Log to CRM
    communicationsHub.inbox.unshift({
        id: Date.now() + 2, platform: 'system', clientId: client.id, clientName: client.name,
        preview: `Client submitted order: ${order.projectName} — $${order.estimate.toLocaleString()}`,
        timestamp: new Date().toISOString(), unread: true,
        metadata: { type: 'client_order', orderId: order.id }
    });
    saveCommHub();

    // Show success
    document.getElementById('clientPortalContent').innerHTML = `
<div style="max-width: 600px; margin: 80px auto; text-align: center; padding: 24px;">
<div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #34d399); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; color: #fff; margin-bottom: 24px;">✓</div>
<h2 style="font-size: 28px; margin-bottom: 12px;">Order Submitted!</h2>
<p style="color: #888; font-size: 16px; margin-bottom: 32px;">Your <strong>${order.projectName}</strong> order has been received. We'll confirm details and send your invoice shortly.</p>
<div style="background: #111; padding: 24px; border-radius: 12px; text-align: left; margin-bottom: 32px;">
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #888;">Order #</span><span>${order.id}</span></div>
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #888;">Package</span><span>${order.packageName}</span></div>
<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #888;">Turnaround</span><span>${order.turnaround}</span></div>
                ${order.estimate > 0 ? `<div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #333;"><span style="color: #888;">Amount</span><span style="color: var(--red); font-weight: 700; font-size: 18px;">$${order.estimate.toLocaleString()}</span></div>` : `<div style="color: #f59e0b; padding-top: 8px; border-top: 1px solid #333;">Custom quote — we'll follow up within 24 hours</div>`}
</div>
<button onclick="loadClientDashboard()" style="padding: 14px 32px; background: var(--red); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Back to Dashboard</button>
</div>
    `;
}

function showClientInvoices() {
    const client = clients.find(c => c.id === currentUser.clientId);
    const myInvoices = invoices.filter(i => i.clientId === client.id);

    document.getElementById('clientPortalContent').innerHTML = `
<div style="max-width: 800px; margin: 0 auto; padding: 24px;">
<button onclick="loadClientDashboard()" style="margin-bottom: 24px; padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 8px; cursor: pointer;">← Back to Dashboard</button>
<h2 style="font-size: 28px; margin-bottom: 24px;">My Invoices</h2>
            ${myInvoices.map(i => `
<div style="background: #111; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center;">
<div>
<div style="font-weight: 600; font-size: 18px;">${i.invoiceNumber || 'INV-' + i.id}</div>
<div style="color: #888; margin-top: 4px;">Due: ${i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A'}</div>
</div>
<div style="text-align: right;">
<div style="font-size: 24px; font-weight: 700;">$${(i.total || 0).toLocaleString()}</div>
<span style="padding: 6px 12px; border-radius: 20px; font-size: 12px; background: ${i.status === 'paid' ? '#10b98120' : '#ef444420'}; color: ${i.status === 'paid' ? '#10b981' : '#ef4444'};">${i.status}</span>
</div>
</div>
                    ${i.status !== 'paid' ? `<button onclick="payInvoice(${i.id})" style="width: 100%; margin-top: 16px; padding: 14px; background: #10b981; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Pay $${(i.total || 0).toLocaleString()} Now</button>` : ''}
</div>
            `).join('')}
</div>
    `;
}

async function payInvoice(invoiceId) {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    // Check if terms already accepted for this invoice
    if (!inv.termsAccepted) {
        showTermsModal({ invoiceId: inv.id, invoice: inv });
        return;
    }

    // Terms already accepted, proceed to payment
    proceedToPayment(inv);
}

async function proceedToPayment(inv) {
    if (!window.STRIPE_PUBLISHABLE_KEY) {
        alert('Payment system not configured. Contact admin to complete payment.');
        return;
    }

    const amount = inv.total || 0;
    if (amount <= 0) {
        alert('Invalid invoice amount.');
        return;
    }

    // Build the Stripe payment modal
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'stripePaymentModal';
    modalOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modalOverlay.innerHTML = `
<div style="background:#fff;border-radius:16px;max-width:480px;width:90%;padding:32px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
<button onclick="closeStripeModal()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;">&times;</button>
<div style="text-align:center;margin-bottom:24px;">
<div style="font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;">New Urban Influence</div>
<h2 style="margin:8px 0 4px;font-size:22px;">Pay Invoice ${inv.invoiceNumber || ''}</h2>
<div style="font-size:28px;font-weight:700;color:#e63946;">$${amount.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
<div style="font-size:13px;color:#888;margin-top:4px;">${inv.projectName || 'Invoice Payment'}</div>
</div>
<div id="stripeCardElement" style="padding:14px;border:2px solid #e0e0e0;border-radius:8px;margin-bottom:16px;min-height:44px;transition:border-color 0.2s;"></div>
<div id="stripeCardErrors" style="color:#e63946;font-size:13px;margin-bottom:12px;min-height:20px;"></div>
<button id="stripePayBtn" onclick="submitStripePayment()" style="width:100%;padding:14px;background:linear-gradient(135deg,#e63946,#d62839);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:opacity 0.2s;">
                Pay $${amount.toLocaleString('en-US', {minimumFractionDigits:2})}
</button>
<div id="stripePaySpinner" style="display:none;text-align:center;padding:14px;">
<div style="display:inline-block;width:24px;height:24px;border:3px solid #e63946;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
<div style="margin-top:8px;color:#666;font-size:14px;">Processing payment...</div>
</div>
<div style="text-align:center;margin-top:12px;">
<img loading="lazy" src="https://img.icons8.com/color/32/stripe.png" alt="Stripe" style="height:20px;opacity:0.6;">
<span style="font-size:11px;color:#aaa;vertical-align:middle;margin-left:4px;">Secured by Stripe</span>
</div>
</div>
    `;
    document.body.appendChild(modalOverlay);

    // Store current invoice for submit handler
    window._stripeCurrentInvoice = inv;

    // Initialize Stripe Elements
    try {
        await loadStripe();
        window._stripeInstance = Stripe(window.STRIPE_PUBLISHABLE_KEY);
        const elements = window._stripeInstance.elements();
        window._stripeCardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    '::placeholder': { color: '#aaa' }
                },
                invalid: { color: '#e63946' }
            }
        });
        window._stripeCardElement.mount('#stripeCardElement');
        window._stripeCardElement.on('change', function(event) {
            const errEl = document.getElementById('stripeCardErrors');
            if (errEl) errEl.textContent = event.error ? event.error.message : '';
        });
    } catch (err) {
        console.error('Stripe init error:', err);
        document.getElementById('stripeCardErrors').textContent = 'Failed to load payment form. Please refresh and try again.';
    }
}

function closeStripeModal() {
    const modal = document.getElementById('stripePaymentModal');
    if (modal) modal.remove();
    if (window._stripeCardElement) {
        window._stripeCardElement.destroy();
        window._stripeCardElement = null;
    }
    window._stripeCurrentInvoice = null;
}

async function submitStripePayment() {
    const inv = window._stripeCurrentInvoice;
    if (!inv) return;

    const payBtn = document.getElementById('stripePayBtn');
    const spinner = document.getElementById('stripePaySpinner');
    const errEl = document.getElementById('stripeCardErrors');

    // Show loading state
    if (payBtn) payBtn.style.display = 'none';
    if (spinner) spinner.style.display = 'block';
    if (errEl) errEl.textContent = '';

    try {
        // Step 1: Create PaymentIntent via Netlify function
        const response = await fetch('/.netlify/functions/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                invoiceId: inv.id,
                amount: inv.total,
                clientId: inv.clientId,
                clientEmail: currentUser?.email || '',
                description: `Invoice ${inv.invoiceNumber || ''} - ${inv.projectName || 'Payment'}`
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to create payment. Please try again.');
        }

        const { clientSecret } = await response.json();

        // Step 2: Confirm payment with Stripe.js
        const { error, paymentIntent } = await window._stripeInstance.confirmCardPayment(clientSecret, {
            payment_method: { card: window._stripeCardElement }
        });

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            // Step 3: Mark invoice as paid locally
            const localInvoices = JSON.parse(localStorage.getItem('nui_invoices') || '[]');
            const idx = localInvoices.findIndex(i => i.id === inv.id);
            if (idx >= 0) {
                localInvoices[idx].status = 'paid';
                localInvoices[idx].paidAt = new Date().toISOString();
                localInvoices[idx].stripe_payment_intent = paymentIntent.id;
                localStorage.setItem('nui_invoices', JSON.stringify(localInvoices));
            }
            // Update in-memory array too
            const memInv = invoices.find(i => i.id === inv.id);
            if (memInv) {
                memInv.status = 'paid';
                memInv.paidAt = new Date().toISOString();
                memInv.stripe_payment_intent = paymentIntent.id;
            }

            // Record payment
            const payment = {
                id: Date.now(),
                clientId: inv.clientId,
                clientName: inv.clientName,
                projectId: inv.projectId,
                projectName: inv.projectName,
                amount: inv.total,
                type: 'invoice',
                date: new Date().toISOString().split('T')[0],
                notes: `Stripe payment for Invoice ${inv.invoiceNumber || ''}`,
                status: 'completed',
                invoiceId: inv.id,
                stripe_payment_id: paymentIntent.id,
                createdAt: new Date().toISOString()
            };
            payments.push(payment);
            savePayments();

            // Trigger loyalty + order updates
            if (typeof triggerInvoicePaid === 'function') triggerInvoicePaid(inv.id);

            // Log to CRM
            if (typeof logProofActivity === 'function') {
                logProofActivity(inv.clientId, 'payment', `Client paid Invoice ${inv.invoiceNumber || ''} ($${inv.total}) via Stripe`);
            }

            // Close modal and show success
            closeStripeModal();
            alert('✅ Payment successful! Thank you for your payment.');

            // Refresh client portal
            if (currentUser?.type === 'client') {
                showClientPortal(currentUser);
            }

            // Trigger backend sync
            if (typeof debouncedSync === 'function') debouncedSync();
        }

    } catch (err) {
        console.error('Payment error:', err);
        if (errEl) errEl.textContent = err.message || 'Payment failed. Please try again.';
        if (payBtn) payBtn.style.display = 'block';
        if (spinner) spinner.style.display = 'none';
    }
}

// Override processPaymentAfterTerms for actual payment flow
processPaymentAfterTerms = async function(invoiceData) {
    const storedInvoices = JSON.parse(localStorage.getItem('nui_invoices') || '[]');
    const idx = storedInvoices.findIndex(i => i.id === invoiceData.invoiceId);
    if (idx >= 0) {
        storedInvoices[idx].termsAccepted = true;
        storedInvoices[idx].termsAcceptedDate = new Date().toISOString();
        localStorage.setItem('nui_invoices', JSON.stringify(storedInvoices));
    }
    // Update in-memory too
    const memInv = invoices.find(i => i.id === invoiceData.invoiceId);
    if (memInv) {
        memInv.termsAccepted = true;
        memInv.termsAcceptedDate = new Date().toISOString();
    }
    // Now proceed to Stripe payment
    await proceedToPayment(invoiceData.invoice);
}

// Update login to route to correct dashboard (async-aware)
const originalHandlePortalLogin = handlePortalLogin;
handlePortalLogin = async function(e) {
    await originalHandlePortalLogin(e);
    // Small delay to let state settle, then route to correct dashboard
    setTimeout(() => {
        if (currentUser?.type === 'designer') {
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            loadDesignerDashboard();
        } else if (currentUser?.type === 'client') {
            document.getElementById('portalLogin').style.display = 'none';
            loadClientDashboard();
        }
    }, 100);
}

// ==================== SESSION AUTO-RESTORE ====================
// Check for existing Supabase session on page load
async function restoreSupabaseSession() {
    if (!window.NuiAuth || !NuiAuth.isAvailable()) {
        console.log('Supabase not available - skipping session restore');
        return;
    }

    try {
        const session = await NuiAuth.getSession();
        if (!session || !session.user) {
            console.log('No active Supabase session');
            return;
        }

        const authUser = session.user;
        console.log('Restoring session for:', authUser.email);

        // Determine role
        const roleInfo = await NuiAuth.getUserRole(authUser);
        const role = roleInfo?.role || 'client';

        if (role === 'admin') {
            currentUser = { type: 'admin', email: authUser.email, name: authUser.user_metadata?.name || 'Admin', id: authUser.id };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            renderAdminSidebar();
            loadAdminDashboardPanel();
        } else if (role === 'manager') {
            currentUser = { type: 'manager', email: authUser.email, name: authUser.user_metadata?.name || 'Manager', id: authUser.id, ...authUser.user_metadata };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            renderAdminSidebar();
            loadAdminDashboardPanel();
        } else if (role === 'designer') {
            const meta = authUser.user_metadata || {};
            currentUser = { type: 'designer', email: authUser.email, name: meta.name || 'Designer', id: authUser.id, ...meta };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            loadDesignerDashboard(currentUser);
        } else {
            currentUser = { type: 'client', email: authUser.email, name: roleInfo?.data?.name || authUser.user_metadata?.name || authUser.email.split('@')[0], id: authUser.id, ...(roleInfo?.data || {}) };
            document.getElementById('portalLogin').style.display = 'none';
            document.getElementById('clientPortal').style.display = 'block';
            showClientPortal(currentUser);
        }

        console.log('Session restored successfully:', currentUser.type, currentUser.email);
    } catch (error) {
        console.warn('Session restore failed:', error.message);
    }
}

// Listen for OAuth redirects (Google sign-in returns here)
if (window.NuiAuth && NuiAuth.isAvailable()) {
    NuiAuth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session && !currentUser) {
            console.log('Auth state: SIGNED_IN via', session.user?.app_metadata?.provider || 'email');
            // If signed in via OAuth redirect and not already logged in, restore session
            await restoreSupabaseSession();
        }
    });
}

// Auto-restore session when portal view loads
const _originalLoadPortalView = typeof loadPortalView === 'function' ? loadPortalView : null;
if (_originalLoadPortalView) {
    const _wrappedLoadPortalView = loadPortalView;
    loadPortalView = function() {
        _wrappedLoadPortalView();
        // After portal renders, try to restore session
        setTimeout(() => restoreSupabaseSession(), 200);
    };
}

// ==================== EMAIL TEMPLATE SYSTEM ====================
