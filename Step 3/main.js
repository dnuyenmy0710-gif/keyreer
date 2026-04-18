/**
 * KEYREER MATRIX - MAIN LOGIC
 * Dynamic personalized career matrix based on Quiz Result and Profile
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data from localStorage
    const rawResult = localStorage.getItem('keyreer_result');
    const rawProfile = localStorage.getItem('keyreer_profile');

    const result = rawResult ? JSON.parse(rawResult) : null;
    const profile = rawProfile ? JSON.parse(rawProfile) : null;

    console.log('Quiz Result:', result);
    console.log('User Profile:', profile);

    // 2. Personalize Central Hub
    const hubTitle = document.getElementById('hub-title');
    if (profile && profile.role) {
        hubTitle.innerHTML = `Phân tích riêng cho<br><strong>${profile.role}</strong>`;
    }

    // 3. Define Career Database (Mapping with RIASEC groups)
    const careerDb = [
        { name: "Kỹ sư cơ khí", group: "R", color: "blue" },
        { name: "Kỹ thuật viên điện", group: "R", color: "blue" },
        { name: "Kiến trúc sư", group: "R", color: "blue" },
        { name: "Công nghệ ô tô", group: "R", color: "blue" },
        { name: "Lập trình viên phần cứng", group: "R", color: "blue" },

        { name: "Nhà khoa học dữ liệu", group: "I", groupName: "Nghiên cứu", color: "purple" },
        { name: "Phân tích tài chính", group: "I", groupName: "Nghiên cứu", color: "purple" },
        { name: "Nhà nghiên cứu", group: "I", groupName: "Nghiên cứu", color: "purple" },
        { name: "Lập trình viên AI", group: "I", groupName: "Nghiên cứu", color: "purple" },
        { name: "Y bác sĩ", group: "I", groupName: "Nghiên cứu", color: "purple" },

        { name: "Thiết kế đồ họa", group: "A", color: "pink" },
        { name: "Kiến trúc sư cảnh quan", group: "A", color: "pink" },
        { name: "Content Creator", group: "A", color: "pink" },
        { name: "Đạo diễn", group: "A", color: "pink" },
        { name: "Copywriter", group: "A", color: "pink" },

        { name: "Quản trị nhân sự", group: "S", color: "green" },
        { name: "Chuyên gia tâm lý", group: "S", color: "green" },
        { name: "Giáo viên", group: "S", color: "green" },
        { name: "Quan hệ công chúng", group: "S", color: "green" },
        { name: "Chăm sóc khách hàng", group: "S", color: "green" },

        { name: "Quản trị kinh doanh", group: "E", color: "orange" },
        { name: "Marketing Manager", group: "E", color: "orange" },
        { name: "Luật sư", group: "E", color: "orange" },
        { name: "Chuyên viên bán hàng", group: "E", color: "orange" },
        { name: "Startup Founder", group: "E", color: "orange" },

        { name: "Kế toán", group: "C", color: "gray" },
        { name: "Kiểm toán", group: "C", color: "gray" },
        { name: "Phân tích nghiệp vụ", group: "C", color: "gray" },
        { name: "Quản lý vận hành", group: "C", color: "gray" },
        { name: "Data Entry Specialist", group: "C", color: "gray" }
    ];

    const groupMeta = result ? result.groupDetails : {
        R: { name: "Kỹ thuật" }, I: { name: "Nghiên cứu" }, A: { name: "Nghệ thuật" },
        S: { name: "Xã hội" }, E: { name: "Quản lý" }, C: { name: "Nghiệp vụ" }
    };

    // 4. Generate Personalized Matrix Nodes
    function generateMatrix() {
        if (!result) {
            // If no result, show static or default matrix
            renderNodes(careerDb.slice(0, 15), false);
            return;
        }

        const scores = result.scores; // e.g. {R: 80, I: 40...}
        const sortedGroups = result.sorted; // e.g. [['R', 80], ['E', 70]...]

        const highGroups = sortedGroups.slice(0, 2).map(g => g[0]); // Top 2
        const medGroups = sortedGroups.slice(2, 4).map(g => g[0]);  // Middle 2
        const lowGroups = sortedGroups.slice(4, 6).map(g => g[0]);  // Bottom 2

        const highCareers = careerDb.filter(c => highGroups.includes(c.group));
        const medCareers = careerDb.filter(c => medGroups.includes(c.group));
        const lowCareers = careerDb.filter(c => lowGroups.includes(c.group));

        renderNodesPersonalized(highCareers, medCareers, lowCareers);
    }

    function renderNodesPersonalized(high, med, low) {
        const careerNodesContainer = document.getElementById('career-nodes');
        careerNodesContainer.innerHTML = '';

        const centerX = 50; // percentage
        const centerY = 50; // percentage
        const isMobile = window.innerWidth <= 768;

        let rings = [];
        if (!isMobile) {
            rings = [
                { level: 'Cao',        items: high, rx: 12, ry: 18 },
                { level: 'Trung bình', items: med,  rx: 28, ry: 34 },
                { level: 'Thấp',       items: low,  rx: 38, ry: 45 },
            ];
        } else {
            rings = [
                { level: 'Cao',        items: high, rx: 15, ry: 22 },
                { level: 'Trung bình', items: med,  rx: 28, ry: 36 },
                { level: 'Thấp',       items: low,  rx: 38, ry: 48 },
            ];
        }

        const reasons = {
          'Cao': 'Dựa trên bài test, đây là nhóm nghề nghiệp phù hợp nhất với tính cách và năng lực tự nhiên của bạn.',
          'Trung bình': 'Nhóm nghề nghiệp này có một số điểm tương đồng với bạn, có thể cân nhắc nếu bạn có sở thích riêng.',
          'Thấp': 'Bạn có ít điểm chung với nhóm này, tuy nhiên vẫn có thể khám phá nếu muốn thử thách bản thân.'
        };

        rings.forEach((ring, ringIdx) => {
            const count = ring.items.length;
            if (count === 0) return;
            const angleStep = (2 * Math.PI) / count;
            const startAngle = ringIdx * (Math.PI / 4.5);

            ring.items.forEach((career, i) => {
                const angle = startAngle + (i * angleStep) + (Math.random() * 0.15 - 0.07);
                const x = centerX + ring.rx * Math.cos(angle);
                const y = centerY + ring.ry * Math.sin(angle);

                let dirClass = '';
                if (!isMobile) {
                    dirClass = x < 50 ? 'node-left' : 'node-right';
                } else {
                    dirClass = y < 50 ? 'node-top' : 'node-bottom';
                }

                const wrapper = document.createElement('div');
                wrapper.className = 'node-wrapper';
                wrapper.style.left = `${x}%`;
                wrapper.style.top = `${y}%`;

                const pct = result.scores[career.group];

                wrapper.innerHTML = `
                    <div class="node-animator" style="animation: float ${4 + Math.random() * 3}s ease-in-out infinite alternate; animation-delay: ${Math.random() * 5}s;">
                        <div class="career-node ${dirClass}">
                            <div class="node-dot ${career.color}"></div>
                            <div class="node-label">${career.name}</div>
                            <div class="node-tooltip">
                                <strong class="tooltip-title">Độ phù hợp: ${ring.level} (${pct}%)</strong>
                                <p class="tooltip-desc">${reasons[ring.level]}</p>
                                <a href="/Step 3/timeline.html?career=${encodeURIComponent(career.name)}" class="tooltip-btn">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                `;

                wrapper.querySelector('.node-dot').addEventListener('click', () => {
                    localStorage.setItem('selectedCareer', career.name);
                    localStorage.setItem('selectedCareerGroup', career.group);
                    // Update tab links
                    const tabDetail = document.getElementById('tab-detail');
                    const tabRoadmap = document.getElementById('tab-roadmap');
                    if (tabDetail) tabDetail.onclick = () => location.href = `/Step 3/timeline.html?career=${encodeURIComponent(career.name)}`;
                    if (tabRoadmap) tabRoadmap.onclick = () => location.href = `/Step 3/roadmap.html?career=${encodeURIComponent(career.name)}`;
                });

                careerNodesContainer.appendChild(wrapper);
            });
        });

        // Set up tab links based on saved career
        const lastCareer = localStorage.getItem('selectedCareer');
        if (lastCareer) {
            const tabDetail = document.getElementById('tab-detail');
            const tabRoadmap = document.getElementById('tab-roadmap');
            if (tabDetail) tabDetail.onclick = () => location.href = `/Step 3/timeline.html?career=${encodeURIComponent(lastCareer)}`;
            if (tabRoadmap) tabRoadmap.onclick = () => location.href = `/Step 3/roadmap.html?career=${encodeURIComponent(lastCareer)}`;
        } else {
            [document.getElementById('tab-detail'), document.getElementById('tab-roadmap')].forEach(tab => {
                if (tab) tab.onclick = () => alert('Vui lòng chọn một nghề nghiệp trên ma trận trước!');
            });
        }
    }

    // 5. Strengths Modal Logic (Typing Effect)
    const centralHub = document.querySelector('.central-hub');
    const strengthsModal = document.getElementById('strengths-modal');
    const closeModal = document.querySelector('.close-modal');
    const typingTitle = document.getElementById('typing-title');
    const typingText = document.getElementById('typing-text');

    centralHub.addEventListener('click', (e) => {
        // Position modal starting from hub for iOS expansion effect
        const rect = centralHub.getBoundingClientRect();
        strengthsModal.style.top = rect.top + 'px';
        strengthsModal.style.left = rect.left + 'px';
        strengthsModal.style.width = rect.width + 'px';
        strengthsModal.style.height = rect.height + 'px';
        strengthsModal.style.borderRadius = '50%';

        // Trigger expand
        setTimeout(() => {
            strengthsModal.classList.add('active');
            startAnalysis();
        }, 10);
    });

    closeModal.addEventListener('click', () => {
        strengthsModal.classList.remove('active');
        // Reset modal for next open
        setTimeout(() => {
            typingTitle.textContent = '';
            typingText.innerHTML = '';
        }, 500);
    });

    function startAnalysis() {
        const data = buildStrengthsText(result);
        typeWriter(typingTitle, data.title, 40, () => {
            typeWriter(typingText, data.text, 15);
        });
    }

    function buildStrengthsText(result) {
        if (!result || !result.sorted) {
            return {
                title: "Phân tích chi tiết bản thân",
                text: "Làm bài trắc nghiệm ở Bước 2 để xem phân tích cá nhân của bạn."
            };
        }

        const topGroups = result.sorted.slice(0, 2);
        const top1 = topGroups[0][0];
        const top2 = topGroups[1][0];

        const title = `Bạn là sự kết hợp giữa ${groupMeta[top1].name.split(' ')[0]} & ${groupMeta[top2].name.split(' ')[0]}`;

        const text = `
            Dựa trên phản hồi của bạn, bạn sở hữu một bản sắc nghề nghiệp độc đáo.
            <br><br>
            <strong>Thế mạnh cốt lõi:</strong> Bạn có điểm số cao nhất ở nhóm <strong>${groupMeta[top1].name}</strong> (${result.scores[top1]}%). Điều này cho thấy bạn là người ${groupMeta[top1].desc}. Bên cạnh đó, nhóm <strong>${groupMeta[top2].name}</strong> (${result.scores[top2]}%) bổ trợ cho bạn khả năng thích nghi và tư duy đa chiều.
            <br><br>
            <strong>Lời khuyên sự nghiệp:</strong> Bạn nên tìm kiếm các môi trường làm việc cho phép bạn phát huy tối đa tính ${top1 === 'R' || top1 === 'C' ? 'kỷ luật và thực tế' : 'sáng tạo và kết nối'}. Đừng ngần ngại thử sức ở những vị trí giao thoa giữa chuyên môn và quản lý.
            <br><br>
            <strong>Lộ trình gợi ý:</strong> Hãy bắt đầu bằng việc tập trung vào các kỹ năng nền tảng của nhóm ${groupMeta[top1].name}, sau đó mở rộng sang các chứng chỉ liên ngành để tạo lợi thế cạnh tranh khác biệt.
        `;

        return { title, text };
    }

    function typeWriter(element, html, speed, callback) {
        let i = 0;
        element.innerHTML = "";
        
        // Handle HTML tags by stripping for timing, then showing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textOnly = tempDiv.textContent || tempDiv.innerText || "";
        
        function type() {
            if (i < html.length) {
                // Check if we're at an HTML tag
                if (html[i] === '<') {
                    const tagEnd = html.indexOf('>', i);
                    element.innerHTML += html.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                } else {
                    element.innerHTML += html[i];
                    i++;
                }
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    // 6. Init Matrix
    generateMatrix();

    // Re-generate on resize for responsiveness
    window.addEventListener('resize', () => {
        generateMatrix();
    });
});
