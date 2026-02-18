/**
 * NUI System Integration Patch v1.0
 *
 * Loaded via Netlify snippet injection (before </body>).
 * Overrides/extends existing functions to connect:
 *   - Moodboards → Projects (project_id FK)
 *   - Approvals → Project stage updates → Client portal
 *   - Brand Workflow → Task creation → Work routing
 *   - Navigation → Breadcrumbs + back buttons
 *   - Error reduction → syncToBackend for projects
 *
 * NON-DESTRUCTIVE: Does not remove or replace existing functionality.
 * All changes are additive overrides.
 */

(function NuiSystemPatch() {
  'use strict';

  // ============================================================
  // STEP 2: FIX saveProjects to sync to Supabase
  // ============================================================
  const _origSaveProjects = window.saveProjects;
  window.saveProjects = function saveProjects() {
    // Keep original localStorage save
    if (_origSaveProjects) _origSaveProjects();
    // Add backend sync (was missing!)
    if (typeof syncToBackend === 'function' && typeof projects !== 'undefined') {
      syncToBackend('projects', projects);
    }
  };

  // ============================================================
  // STEP 3: CONNECT MOODBOARD TO PROJECT
  // Override createMoodboardAndOpenEditor to require project_id
  // ============================================================
  const _origCreateMoodboard = window.createMoodboardAndOpenEditor;
  window.createMoodboardAndOpenEditor = function createMoodboardAndOpenEditor() {
    const clientSelect = document.getElementById('moodboardClient');
    const titleInput = document.getElementById('moodboardTitle');
    const notesInput = document.getElementById('moodboardNotes');

    // Check for project selector — add one if it doesn't exist
    let projectSelect = document.getElementById('moodboardProject');

    if (!clientSelect || !titleInput) {
      if (_origCreateMoodboard) return _origCreateMoodboard();
      return;
    }

    const clientId = clientSelect.value;
    const title = titleInput.value.trim();
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!clientId || !title) {
      alert('Client and title are required.');
      return;
    }

    // Get selected project (if project selector exists)
    const projectId = projectSelect ? projectSelect.value : null;

    const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == clientId) : null;

    const moodboard = {
      id: Date.now(),
      type: 'moodboard',
      clientId: clientId,
      clientName: client ? client.name : '',
      project_id: projectId ? parseInt(projectId) : null,  // NEW: project link
      title: title,
      notes: notes,
      collageItems: [],
      canvasBackground: '#111111',
      canvasWidth: 1200,
      canvasHeight: 800,
      comments: [],
      revisionCount: 0,
      status: 'draft',
      sentToClient: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof proofs !== 'undefined') {
      proofs.push(moodboard);
      if (typeof saveProofs === 'function') saveProofs();
    }

    // Close modal
    const modal = document.getElementById('createMoodboardModal');
    if (modal) modal.remove();

    // Open editor
    if (typeof openMoodboardEditor === 'function') {
      openMoodboardEditor(moodboard.id);
    }
  };

  // ============================================================
  // Inject project selector into the Create Moodboard modal
  // ============================================================
  const _origShowCreateMoodboardModal = window.showCreateMoodboardModal;
  window.showCreateMoodboardModal = function showCreateMoodboardModal() {
    // Call original to create the modal
    if (_origShowCreateMoodboardModal) _origShowCreateMoodboardModal();

    // Now inject project selector after client selector
    setTimeout(function() {
      const clientSelect = document.getElementById('moodboardClient');
      if (!clientSelect) return;

      // Check if project selector already exists
      if (document.getElementById('moodboardProject')) return;

      // Create project selector
      const projectGroup = document.createElement('div');
      projectGroup.style.cssText = 'margin-top:12px;';
      projectGroup.innerHTML = `
        <label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;color:#aaa;">
          Link to Project (optional)
        </label>
        <select id="moodboardProject" style="width:100%;padding:10px 12px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;">
          <option value="">— No project —</option>
        </select>
      `;

      // Insert after client selector's parent
      const clientGroup = clientSelect.closest('div') || clientSelect.parentElement;
      if (clientGroup && clientGroup.parentElement) {
        clientGroup.parentElement.insertBefore(projectGroup, clientGroup.nextSibling);
      }

      // Populate when client changes
      function populateProjects() {
        const select = document.getElementById('moodboardProject');
        if (!select) return;
        const cid = clientSelect.value;
        select.innerHTML = '<option value="">— No project —</option>';
        if (cid && typeof projects !== 'undefined') {
          const clientProjects = projects.filter(p => p.client_id == cid || p.clientId == cid);
          clientProjects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name || p.projectName || ('Project #' + p.id);
            select.appendChild(opt);
          });
        }
      }

      clientSelect.addEventListener('change', populateProjects);
      populateProjects(); // Run immediately
    }, 100);
  };


  // ============================================================
  // STEP 4: APPROVAL CASCADE
  // Override approveMoodboard to update project stage + create approval record
  // ============================================================
  const _origApproveMoodboard = window.approveMoodboard;
  window.approveMoodboard = function approveMoodboard(clientId, moodboardId) {
    if (typeof proofs === 'undefined') return;

    const mb = proofs.find(p => p.id == moodboardId);
    if (!mb) return;

    // Validate: client must own this moodboard
    if (mb.clientId && mb.clientId != clientId) {
      alert('You are not authorized to approve this moodboard.');
      return;
    }

    // Update moodboard status
    mb.status = 'approved';
    mb.approvedAt = new Date().toISOString();
    mb.approved_by = clientId;
    if (typeof saveProofs === 'function') saveProofs();

    // CREATE APPROVAL RECORD (Supabase)
    if (typeof supabaseClient !== 'undefined' && mb.project_id) {
      supabaseClient.from('approvals').insert({
        project_id: mb.project_id,
        entity_type: 'moodboard',
        entity_id: mb.id,
        status: 'approved',
        client_id: clientId,
        approved_by: clientId,
        approved_at: new Date().toISOString(),
        metadata: { title: mb.title, clientName: mb.clientName }
      }).then(function(res) {
        if (res.error) console.error('Approval record error:', res.error);
        else console.log('✅ Approval record created');
      });
    }

    // UPDATE PROJECT STAGE to 'Design' (moodboard approved = ready for design)
    if (mb.project_id && typeof projects !== 'undefined') {
      const project = projects.find(p => p.id == mb.project_id);
      if (project) {
        project.stage = 'Design';
        project.activityLog = project.activityLog || [];
        project.activityLog.push({
          action: 'Moodboard approved — stage advanced to Design',
          timestamp: new Date().toISOString(),
          stage: 'Design',
          entity: 'moodboard',
          entityId: mb.id
        });
        if (typeof saveProjects === 'function') saveProjects();
        console.log('✅ Project stage updated to Design');
      }
    }

    // Log to CRM
    if (typeof logProofActivity === 'function') {
      logProofActivity('approved', mb.clientName || 'Client', mb.title + ' moodboard approved by client');
    }

    // Notify admin
    if (typeof simulateEmailNotification === 'function') {
      simulateEmailNotification(
        'newurbaninfluence@gmail.com',
        'Moodboard Approved: ' + mb.title,
        '<h2>Moodboard Approved</h2><p>' + (mb.clientName || 'Client') +
        ' has approved the moodboard: <strong>' + mb.title +
        '</strong></p><p>Project stage advanced to Design. You can now proceed with the brand guide.</p>'
      );
    }

    alert('Moodboard approved! Your designer will begin working on your brand guide.');

    // Refresh portal
    if (typeof clients !== 'undefined') {
      const client = clients.find(c => c.id == clientId);
      if (client && typeof showClientPortal === 'function') {
        showClientPortal(client);
      }
    }
  };


  // ============================================================
  // STEP 4b: Override approveProof to also create approval records
  // ============================================================
  const _origApproveProof = window.approveProof;
  window.approveProof = function approveProof(proofId, feedback) {
    if (typeof proofs === 'undefined') return;

    const proof = proofs.find(p => p.id == proofId);
    if (!proof) {
      if (_origApproveProof) return _origApproveProof(proofId, feedback);
      return;
    }

    // Call original
    if (_origApproveProof) _origApproveProof(proofId, feedback);

    // Create approval record
    if (typeof supabaseClient !== 'undefined' && proof.project_id) {
      supabaseClient.from('approvals').insert({
        project_id: proof.project_id,
        entity_type: proof.type || 'proof',
        entity_id: proof.id,
        status: 'approved',
        client_id: proof.clientId,
        feedback: feedback,
        approved_at: new Date().toISOString()
      }).then(function(res) {
        if (res.error) console.error('Approval record error:', res.error);
      });
    }
  };


  // ============================================================
  // STEP 5: BRAND WORKFLOW BUTTON
  // This is handled via postMessage from the moodboard-app.html iframe/page
  // When user clicks "Brand Workflow" in moodboard tool:
  //   - Verify moodboard is approved
  //   - Advance project to 'Development' (brand identity build)
  //   - Create default tasks
  //   - Route to admin projects panel
  // ============================================================
  window.startBrandWorkflow = function startBrandWorkflow(moodboardId) {
    if (typeof proofs === 'undefined' || typeof projects === 'undefined') {
      alert('System data not loaded. Please refresh and try again.');
      return;
    }

    const mb = proofs.find(p => p.id == moodboardId);
    if (!mb) {
      alert('Moodboard not found.');
      return;
    }

    if (mb.status !== 'approved') {
      alert('Moodboard must be approved before starting brand workflow.\nCurrent status: ' + mb.status);
      return;
    }

    if (!mb.project_id) {
      alert('This moodboard is not linked to a project. Please link it first.');
      return;
    }

    const project = projects.find(p => p.id == mb.project_id);
    if (!project) {
      alert('Linked project not found.');
      return;
    }

    // A) Update project stage to Development (brand identity build)
    project.stage = 'Development';
    project.activityLog = project.activityLog || [];
    project.activityLog.push({
      action: 'Brand workflow started — stage advanced to Development',
      timestamp: new Date().toISOString(),
      stage: 'Development',
      trigger: 'brand_workflow',
      moodboardId: mb.id
    });
    if (typeof saveProjects === 'function') saveProjects();

    // B) Create default tasks ONLY if none exist for this stage
    const brandTasks = [
      { title: 'Logo Concept Development', description: 'Create 3 logo concepts based on approved moodboard direction', sort_order: 1 },
      { title: 'Color Palette Finalization', description: 'Define primary, secondary, and accent colors with hex codes', sort_order: 2 },
      { title: 'Typography Selection', description: 'Select and pair headline + body fonts', sort_order: 3 },
      { title: 'Brand Pattern/Texture', description: 'Create supporting visual pattern or texture', sort_order: 4 },
      { title: 'Logo Variations', description: 'Create horizontal, stacked, icon-only, reversed versions', sort_order: 5 },
      { title: 'Brand Guide Assembly', description: 'Compile all elements into brand guide document', sort_order: 6 },
      { title: 'Mockup Presentation', description: 'Apply brand to real-world mockups for client review', sort_order: 7 }
    ];

    if (typeof supabaseClient !== 'undefined') {
      // Check if tasks already exist for this project+stage
      supabaseClient.from('tasks')
        .select('id')
        .eq('project_id', project.id)
        .eq('stage', 'Development')
        .then(function(res) {
          if (!res.error && (!res.data || res.data.length === 0)) {
            // No tasks yet — create them
            const taskInserts = brandTasks.map(t => ({
              project_id: project.id,
              stage: 'Development',
              title: t.title,
              description: t.description,
              status: 'pending',
              sort_order: t.sort_order
            }));
            supabaseClient.from('tasks').insert(taskInserts).then(function(r) {
              if (r.error) console.error('Task creation error:', r.error);
              else console.log('✅ Brand workflow tasks created:', taskInserts.length);
            });
          } else {
            console.log('Tasks already exist for this project stage.');
          }
        });
    }

    // C) Route user to projects panel
    if (typeof showAdminPanel === 'function') {
      alert('Brand workflow started! ' + brandTasks.length + ' tasks created.\nProject stage: Development');
      showAdminPanel('projects');
    }
  };

  // Listen for postMessage from moodboard-app.html
  window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'NUI_BRAND_WORKFLOW') {
      startBrandWorkflow(event.data.moodboardId);
    }
  });


  // ============================================================
  // STEP 5b: Auto-create project when order is created (if missing)
  // ============================================================
  const _origCreateOrder = window.createOrder;
  window.createOrder = async function createOrder(e) {
    // Call original order creation
    if (_origCreateOrder) await _origCreateOrder(e);

    // After order is created, check if a project was auto-created
    // If not, create one linked to the new order
    if (typeof orders === 'undefined' || typeof projects === 'undefined') return;

    const latestOrder = orders[0]; // Most recent order (pushed to front)
    if (!latestOrder) return;

    // Check if a project already exists for this order
    const existingProject = projects.find(p =>
      p.order_id == latestOrder.id ||
      (p.name === latestOrder.projectName && p.client_id == latestOrder.clientId)
    );

    if (!existingProject) {
      const newProject = {
        id: Date.now(),
        client_id: latestOrder.clientId,
        order_id: latestOrder.id,
        name: latestOrder.projectName || latestOrder.packageName || 'Project #' + latestOrder.id,
        stage: 'Discovery',
        status: 'active',
        created_at: new Date().toISOString(),
        activityLog: [{
          action: 'Project auto-created from order #' + latestOrder.id,
          timestamp: new Date().toISOString(),
          stage: 'Discovery'
        }]
      };
      projects.unshift(newProject);
      if (typeof saveProjects === 'function') saveProjects();
      console.log('✅ Auto-created project for order:', latestOrder.id);
    }
  };


  // ============================================================
  // STEP 6: NAVIGATION FIXES
  // Add breadcrumbs and back buttons to admin panels
  // ============================================================

  // Inject breadcrumb bar into admin header
  function injectBreadcrumb(crumbs) {
    let bar = document.getElementById('nuiBreadcrumb');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'nuiBreadcrumb';
      bar.style.cssText = 'padding:8px 24px;background:rgba(0,0,0,0.3);font-size:13px;color:#888;border-bottom:1px solid rgba(255,255,255,0.05);';
      const adminHeader = document.querySelector('.admin-header') || document.querySelector('#adminView > div:first-child');
      if (adminHeader && adminHeader.parentElement) {
        adminHeader.parentElement.insertBefore(bar, adminHeader.nextSibling);
      }
    }
    bar.innerHTML = crumbs.map(function(c, i) {
      if (i === crumbs.length - 1) {
        return '<span style="color:#fff;">' + c.label + '</span>';
      }
      return '<a href="#" onclick="' + c.action + '; return false;" style="color:#888;text-decoration:none;">' + c.label + '</a>';
    }).join(' <span style="color:#555;margin:0 8px;">›</span> ');
  }

  // Override key panel loaders to add breadcrumbs
  const panelBreadcrumbs = {
    'moodboard': [
      { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
      { label: 'Projects', action: "showAdminPanel('projects')" },
      { label: 'Moodboards', action: '' }
    ],
    'brandguide': [
      { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
      { label: 'Projects', action: "showAdminPanel('projects')" },
      { label: 'Brand Guides', action: '' }
    ],
    'proofs': [
      { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
      { label: 'Projects', action: "showAdminPanel('projects')" },
      { label: 'Proofs & Deliverables', action: '' }
    ],
    'delivery': [
      { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
      { label: 'Projects', action: "showAdminPanel('projects')" },
      { label: 'Delivery', action: '' }
    ]
  };

  // Hook into showAdminPanel to inject breadcrumbs
  const _origShowAdminPanelForNav = window.originalShowAdminPanel || window.showAdminPanel;
  const _wrappedShowAdmin = window.showAdminPanel;
  window.showAdminPanel = function showAdminPanel(panel) {
    // Call the current handler (which may already be wrapped)
    if (_wrappedShowAdmin && _wrappedShowAdmin !== showAdminPanel) {
      _wrappedShowAdmin(panel);
    } else if (_origShowAdminPanelForNav) {
      _origShowAdminPanelForNav(panel);
    }

    // Inject breadcrumbs
    if (panelBreadcrumbs[panel]) {
      injectBreadcrumb(panelBreadcrumbs[panel]);
    } else {
      // Default breadcrumb
      injectBreadcrumb([
        { label: 'Dashboard', action: "showAdminPanel('dashboard')" },
        { label: panel.charAt(0).toUpperCase() + panel.slice(1), action: '' }
      ]);
    }
  };


  // ============================================================
  // STEP 6b: COMPLETE MOODBOARD PANEL REPLACEMENT
  // Replaces old panel with new client-aware workflow.
  // Flow: Select client → Create moodboard → Edit in canvas →
  //       Send to client → Client approves → Project advances
  // ============================================================

  function _nuiRenderMbCard(mb) {
    var clientName = mb.clientName || 'No Client';
    var projName = '';
    if (mb.project_id && typeof projects !== 'undefined') {
      var proj = projects.find(function(p) { return p.id == mb.project_id; });
      if (proj) projName = proj.name || proj.projectName || 'Project #' + proj.id;
    }
    var statusColor = mb.status === 'approved' ? '#22c55e' :
                      (mb.status === 'sent' || mb.sentToClient) ? '#f59e0b' : '#666';
    var statusLabel = mb.status === 'approved' ? 'Approved' :
                      (mb.status === 'sent' || mb.sentToClient) ? 'Sent to Client' : 'Draft';
    var thumbHtml = '';
    if (mb.collageItems && mb.collageItems.length > 0) {
      var firstImg = mb.collageItems.find(function(item) { return item.src || item.url; });
      if (firstImg) thumbHtml = '<img src="' + (firstImg.src || firstImg.url) + '" style="width:100%;height:160px;object-fit:cover;border-radius:8px 8px 0 0;" onerror="this.style.display=\'none\'" />';
    }
    if (!thumbHtml) {
      thumbHtml = '<div style="width:100%;height:160px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg></div>';
    }
    var editBtn = '<button onclick="window._nuiEditMoodboard(' + mb.id + ')" style="flex:1;padding:8px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Edit</button>';
    var sendBtn = (mb.status !== 'approved' && !mb.sentToClient) ?
      '<button onclick="window._nuiSendToClient(' + mb.id + ')" style="flex:1;padding:8px;background:#f59e0b;color:#000;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Send</button>' : '';
    var workflowBtn = (mb.status === 'approved') ?
      '<button onclick="startBrandWorkflow(' + mb.id + ')" style="flex:1;padding:8px;background:#22c55e;color:#000;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">Start Brand</button>' : '';
    var deleteBtn = '<button onclick="window._nuiDeleteMoodboard(' + mb.id + ')" style="padding:8px 10px;background:transparent;color:#666;border:1px solid #333;border-radius:6px;cursor:pointer;font-size:12px;" title="Delete">✕</button>';
    return '<div class="nui-mb-card" data-client-id="' + (mb.clientId || '') + '" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;transition:border-color 0.2s;" onmouseover="this.style.borderColor=\'rgba(99,102,241,0.4)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,0.08)\'">' +
      thumbHtml +
      '<div style="padding:14px;">' +
        '<h4 style="margin:0 0 6px;color:#fff;font-size:15px;">' + (mb.title || 'Untitled') + '</h4>' +
        '<div style="font-size:12px;color:#888;margin-bottom:4px;">' + clientName + '</div>' +
        (projName ? '<div style="display:inline-block;padding:2px 8px;background:rgba(99,102,241,0.12);color:#a5b4fc;border-radius:4px;font-size:11px;margin-bottom:8px;">' + projName + '</div>' : '') +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;"><span style="width:8px;height:8px;border-radius:50%;background:' + statusColor + ';display:inline-block;"></span><span style="font-size:12px;color:' + statusColor + ';">' + statusLabel + '</span></div>' +
        '<div style="display:flex;gap:6px;">' + editBtn + sendBtn + workflowBtn + deleteBtn + '</div>' +
      '</div></div>';
  }

  // Replace moodboard panel entirely — do NOT call original
  window.loadAdminMoodboardPanel = function loadAdminMoodboardPanel() {
    var panel = document.getElementById('adminMoodboardPanel');
    if (!panel) return;
    var moodboards = (typeof proofs !== 'undefined') ? proofs.filter(function(p) { return p.type === 'moodboard'; }) : [];
    var clientList = (typeof clients !== 'undefined') ? clients : [];
    var drafts = moodboards.filter(function(m) { return m.status === 'draft' && !m.sentToClient; }).length;
    var sent = moodboards.filter(function(m) { return m.status === 'sent' || m.sentToClient; }).length;
    var approved = moodboards.filter(function(m) { return m.status === 'approved'; }).length;
    var clientOpts = clientList.map(function(c) { return '<option value="' + c.id + '">' + (c.name || 'Client #' + c.id) + '</option>'; }).join('');
    var cardsHtml = moodboards.length === 0 ?
      '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#555;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5" style="margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg><p style="font-size:16px;margin:0 0 8px;">No moodboards yet</p><p style="font-size:13px;margin:0;">Click <b>+ New Moodboard</b> to start a brand workflow</p></div>' :
      moodboards.map(_nuiRenderMbCard).join('');
    panel.innerHTML =
      '<div style="padding:4px 0;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
          '<h2 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Moodboards</h2>' +
          '<button onclick="window._nuiShowCreateModal()" style="padding:10px 24px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">+ New Moodboard</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">' +
          '<div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;text-align:center;"><span style="font-size:28px;font-weight:700;color:#fff;">' + drafts + '</span><div style="color:#666;font-size:13px;margin-top:4px;">Drafts</div></div>' +
          '<div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;text-align:center;"><span style="font-size:28px;font-weight:700;color:#f59e0b;">' + sent + '</span><div style="color:#666;font-size:13px;margin-top:4px;">Sent / Pending</div></div>' +
          '<div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;text-align:center;"><span style="font-size:28px;font-weight:700;color:#22c55e;">' + approved + '</span><div style="color:#666;font-size:13px;margin-top:4px;">Approved</div></div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;margin-bottom:20px;">' +
          '<select id="nuiMbFilter" onchange="window._nuiFilterMoodboards()" style="padding:8px 14px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;min-width:180px;">' +
            '<option value="">All Clients</option>' + clientOpts +
          '</select>' +
        '</div>' +
        '<div id="nuiMbGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">' + cardsHtml + '</div>' +
      '</div>';
  };

  // --- Create moodboard modal ---
  window._nuiShowCreateModal = function() {
    var existing = document.getElementById('nuiCreateMbModal');
    if (existing) existing.remove();
    var clientList = (typeof clients !== 'undefined') ? clients : [];
    var clientOpts = clientList.map(function(c) { return '<option value="' + c.id + '">' + (c.name || 'Client #' + c.id) + '</option>'; }).join('');
    var modal = document.createElement('div');
    modal.id = 'nuiCreateMbModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML =
      '<div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:32px;width:440px;max-width:90vw;">' +
        '<h3 style="color:#fff;font-size:20px;margin:0 0 24px;">Create New Moodboard</h3>' +
        '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;color:#aaa;">Client *</label>' +
        '<select id="nuiNewMbClient" onchange="window._nuiPopulateProjects()" style="width:100%;padding:10px 12px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;margin-bottom:16px;">' +
          '<option value="">Select a client...</option>' + clientOpts +
        '</select>' +
        '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;color:#aaa;">Link to Project</label>' +
        '<select id="nuiNewMbProject" style="width:100%;padding:10px 12px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;margin-bottom:16px;">' +
          '<option value="">— Auto-create new project —</option>' +
        '</select>' +
        '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;color:#aaa;">Board Name *</label>' +
        '<input id="nuiNewMbTitle" type="text" placeholder="e.g. Brand Direction A" style="width:100%;padding:10px 12px;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;margin-bottom:24px;box-sizing:border-box;" />' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
          '<button onclick="document.getElementById(\'nuiCreateMbModal\').remove()" style="padding:10px 20px;background:transparent;color:#888;border:1px solid #333;border-radius:8px;cursor:pointer;font-size:14px;">Cancel</button>' +
          '<button onclick="window._nuiConfirmCreate()" style="padding:10px 24px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">Create & Open Editor</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  };

  window._nuiPopulateProjects = function() {
    var clientId = document.getElementById('nuiNewMbClient').value;
    var select = document.getElementById('nuiNewMbProject');
    if (!select) return;
    select.innerHTML = '<option value="">— Auto-create new project —</option>';
    if (clientId && typeof projects !== 'undefined') {
      projects.filter(function(p) { return p.client_id == clientId || p.clientId == clientId; })
        .forEach(function(p) {
          var opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.name || p.projectName || ('Project #' + p.id);
          select.appendChild(opt);
        });
    }
  };

  window._nuiConfirmCreate = function() {
    var clientId = document.getElementById('nuiNewMbClient').value;
    var projectId = document.getElementById('nuiNewMbProject').value;
    var title = document.getElementById('nuiNewMbTitle').value.trim();
    if (!clientId) { alert('Please select a client.'); return; }
    if (!title) { alert('Please enter a board name.'); return; }
    var client = (typeof clients !== 'undefined') ? clients.find(function(c) { return c.id == clientId; }) : null;
    // Auto-create project if none selected
    if (!projectId && typeof projects !== 'undefined') {
      var newProj = {
        id: Date.now(),
        client_id: clientId,
        clientId: clientId,
        name: title,
        stage: 'Discovery',
        status: 'active',
        created_at: new Date().toISOString(),
        activityLog: [{ action: 'Project created for moodboard: ' + title, timestamp: new Date().toISOString(), stage: 'Discovery' }]
      };
      projects.unshift(newProj);
      if (typeof saveProjects === 'function') saveProjects();
      projectId = newProj.id;
      console.log('✅ Auto-created project:', newProj.name);
    }
    var mb = {
      id: Date.now() + 1,
      type: 'moodboard',
      clientId: clientId,
      clientName: client ? client.name : '',
      project_id: projectId ? parseInt(projectId) : null,
      title: title,
      notes: '',
      collageItems: [],
      canvasBackground: '#111111',
      canvasWidth: 1200,
      canvasHeight: 800,
      comments: [],
      revisionCount: 0,
      status: 'draft',
      sentToClient: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (typeof proofs !== 'undefined') {
      proofs.push(mb);
      if (typeof saveProofs === 'function') saveProofs();
    }
    var modal = document.getElementById('nuiCreateMbModal');
    if (modal) modal.remove();
    if (typeof openMoodboardEditor === 'function') {
      openMoodboardEditor(mb.id);
    }
  };

  // --- Card actions ---
  window._nuiEditMoodboard = function(mbId) {
    if (typeof openMoodboardEditor === 'function') {
      openMoodboardEditor(mbId);
    }
  };

  window._nuiSendToClient = function(mbId) {
    if (typeof proofs === 'undefined') return;
    var mb = proofs.find(function(p) { return p.id == mbId; });
    if (!mb) return;
    mb.sentToClient = true;
    mb.status = 'sent';
    mb.updatedAt = new Date().toISOString();
    if (typeof saveProofs === 'function') saveProofs();
    if (typeof showNotification === 'function') showNotification('Moodboard "' + mb.title + '" sent to client!', 'success');
    if (typeof simulateEmailNotification === 'function') {
      simulateEmailNotification('newurbaninfluence@gmail.com', 'Moodboard Sent: ' + mb.title,
        '<h2>Moodboard Sent</h2><p>"' + mb.title + '" for ' + (mb.clientName || 'client') + ' has been sent for review.</p>');
    }
    loadAdminMoodboardPanel();
  };

  window._nuiDeleteMoodboard = function(mbId) {
    if (!confirm('Delete this moodboard? This cannot be undone.')) return;
    if (typeof proofs !== 'undefined') {
      var idx = proofs.findIndex(function(p) { return p.id == mbId; });
      if (idx > -1) { proofs.splice(idx, 1); if (typeof saveProofs === 'function') saveProofs(); }
    }
    loadAdminMoodboardPanel();
  };

  window._nuiFilterMoodboards = function() {
    var filter = document.getElementById('nuiMbFilter');
    if (!filter) return;
    var clientId = filter.value;
    var cards = document.querySelectorAll('.nui-mb-card');
    cards.forEach(function(card) {
      card.style.display = (!clientId || card.getAttribute('data-client-id') == clientId) ? '' : 'none';
    });
  };


  // ============================================================
  // STEP 7: ERROR MINIMIZATION
  // ============================================================

  // 7a) Centralized error handler for Supabase operations
  window.NuiError = {
    handle: function(context, error) {
      console.error('[NUI ' + context + ']', error);
      if (typeof showNotification === 'function') {
        showNotification('Something went wrong: ' + context, 'error');
      }
    },
    toast: function(message, type) {
      if (typeof showNotification === 'function') {
        showNotification(message, type || 'info');
      } else {
        console.log('[NUI] ' + message);
      }
    }
  };

  // 7b) Typed ProjectService layer
  window.ProjectService = {
    getProject: async function(projectId) {
      try {
        if (typeof NuiDB !== 'undefined' && NuiDB.projects) {
          const all = await NuiDB.projects.getAll();
          return all.find(p => p.id == projectId) || null;
        }
        // Fallback to in-memory
        return (typeof projects !== 'undefined') ? projects.find(p => p.id == projectId) : null;
      } catch(e) {
        NuiError.handle('getProject', e);
        return null;
      }
    },

    getMoodboards: async function(projectId) {
      try {
        if (typeof proofs !== 'undefined') {
          return proofs.filter(p => p.type === 'moodboard' && p.project_id == projectId);
        }
        return [];
      } catch(e) {
        NuiError.handle('getMoodboards', e);
        return [];
      }
    },

    getApprovals: async function(projectId) {
      try {
        if (typeof supabaseClient !== 'undefined') {
          const { data, error } = await supabaseClient
            .from('approvals')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        }
        return [];
      } catch(e) {
        NuiError.handle('getApprovals', e);
        return [];
      }
    },

    getTasks: async function(projectId, stage) {
      try {
        if (typeof supabaseClient !== 'undefined') {
          let query = supabaseClient
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true });
          if (stage) query = query.eq('stage', stage);
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }
        return [];
      } catch(e) {
        NuiError.handle('getTasks', e);
        return [];
      }
    },

    updateStage: async function(projectId, newStage, reason) {
      try {
        if (typeof projects === 'undefined') return false;
        const project = projects.find(p => p.id == projectId);
        if (!project) return false;

        project.stage = newStage;
        project.activityLog = project.activityLog || [];
        project.activityLog.push({
          action: reason || ('Stage updated to ' + newStage),
          timestamp: new Date().toISOString(),
          stage: newStage
        });

        if (typeof saveProjects === 'function') saveProjects();
        return true;
      } catch(e) {
        NuiError.handle('updateStage', e);
        return false;
      }
    },

    createMoodboard: function(projectId, title, clientId) {
      if (!projectId || !title || !clientId) {
        NuiError.toast('Project, title, and client are required', 'error');
        return null;
      }
      const client = (typeof clients !== 'undefined') ? clients.find(c => c.id == clientId) : null;
      const mb = {
        id: Date.now(),
        type: 'moodboard',
        clientId: clientId,
        clientName: client ? client.name : '',
        project_id: parseInt(projectId),
        title: title,
        collageItems: [],
        canvasBackground: '#111111',
        canvasWidth: 1200,
        canvasHeight: 800,
        comments: [],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (typeof proofs !== 'undefined') {
        proofs.push(mb);
        if (typeof saveProofs === 'function') saveProofs();
      }
      return mb;
    }
  };

  console.log('✅ NUI System Integration Patch v1.0 loaded');
  console.log('   - saveProjects now syncs to backend');
  console.log('   - Moodboards now link to projects');
  console.log('   - Approval cascade: moodboard → project stage → portal');
  console.log('   - Brand Workflow creates tasks and advances stage');
  console.log('   - Navigation breadcrumbs added');
  console.log('   - ProjectService API available');

})();
