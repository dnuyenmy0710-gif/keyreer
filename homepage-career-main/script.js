document.addEventListener('DOMContentLoaded', () => {
    const quoteElement = document.getElementById('typewriter-quote');
    const quoteIconTop = document.querySelector('.quote-icon-top');
    const quoteIconBottom = document.querySelector('.quote-icon-bottom');
    const authorElement = document.getElementById('author-text');
    const scrollHint = document.getElementById('scroll-hint');
    const floatingNav = document.getElementById('floating-nav');
    const startNavBtn = document.getElementById('start-nav');
    const featuresSection = document.getElementById('features');
    const stepsSection = document.getElementById('steps');
    const stepCards = document.querySelectorAll('.step-card');

    // --- Global State ---
    let typewriterFinished = false;

    // --- Initial Lock ---
    document.body.style.overflowY = 'hidden';

    // --- Helper: Scroll Transition Logic ---
    function handleScrollTransitions() {
        const scrollThreshold = 100;
        const isPastHero = window.scrollY > scrollThreshold;

        if (isPastHero) {
            // FULL NAVIGATION MODE
            if (floatingNav) {
                floatingNav.classList.add('visible');
                floatingNav.classList.remove('hero-mode');
                if (startNavBtn) {
                    startNavBtn.innerHTML = `<span class="btn-text">BẮT ĐẦU</span>`;
                    startNavBtn.dataset.action = 'assessment';
                    startNavBtn.style.paddingLeft = '1.5rem';
                    startNavBtn.style.paddingRight = '1.5rem';
                    startNavBtn.style.gap = '0';
                }
            }
        } else {
            // HERO SCROLL MODE (SAME FRAME)
            if (floatingNav && typewriterFinished) {
                floatingNav.classList.add('visible');
                floatingNav.classList.add('hero-mode');
                if (startNavBtn) {
                    startNavBtn.innerHTML = `
                        <span class="btn-text" style="font-size: 0.9rem">CUỘN ĐỂ XEM THÊM</span>
                        <div class="icon-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                        </div>
                    `;
                    startNavBtn.dataset.action = 'scroll';
                    startNavBtn.style.paddingLeft = '2.5rem';
                    startNavBtn.style.paddingRight = '0.5rem';
                    startNavBtn.style.gap = '1.2rem';
                }
            } else if (floatingNav) {
                floatingNav.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', handleScrollTransitions);

    // --- Typewriter Execution ---
    if (quoteElement) {
        const textToType = quoteElement.getAttribute('data-text');
        quoteElement.innerHTML = '';

        // Prepare characters by word to prevent broken lines
        const words = textToType.split(' ');
        words.forEach((word, wIdx) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.style.whiteSpace = 'nowrap';
            wordSpan.style.display = 'inline-block';

            word.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });

            quoteElement.appendChild(wordSpan);

            // Add space after word (except last word)
            if (wIdx < words.length - 1) {
                const space = document.createElement('span');
                space.className = 'char';
                space.textContent = '\u00A0'; // Non-breaking space
                quoteElement.appendChild(space);
            }
        });

        const characters = quoteElement.querySelectorAll('.char');
        let currentIndex = 0;
        const typingSpeed = 40;

        function drawText() {
            if (currentIndex < characters.length) {
                characters[currentIndex].classList.add('visible');
                currentIndex++;
                setTimeout(drawText, charTypeDelay(characters[currentIndex - 1].textContent));
            } else {
                // Done Typing
                if (quoteIconBottom) quoteIconBottom.classList.add('visible');

                setTimeout(() => {
                    // Show Author
                    if (authorElement) {
                        authorElement.style.opacity = '1';
                        authorElement.style.transition = 'opacity 1s ease';
                    }

                    // Set flag and call handler
                    typewriterFinished = true;
                    handleScrollTransitions();

                    // Unlock Scroll
                    document.body.style.overflowY = 'auto';
                    if (featuresSection) featuresSection.classList.add('visible');
                }, 500);
            }
        }

        function charTypeDelay(char) {
            if (char === '\u00A0') return 50;
            if (char === ',' || char === '.') return 150;
            return typingSpeed;
        }

        // Start animation sequence
        setTimeout(() => {
            if (quoteIconTop) quoteIconTop.classList.add('visible');
            setTimeout(drawText, 800);
        }, 500);
    }

    // --- Step Cards Intersection Observer ---
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    stepCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.15}s`;
        cardObserver.observe(card);
    });

    // --- Assessment Logic ---
    const assessmentOverlay = document.getElementById('assessment-overlay');
    const resultsOverlay = document.getElementById('results-overlay');
    const footerStartBtn = document.getElementById('footer-cta-btn');
    const closeAssessment = document.getElementById('close-assessment');
    const closeResults = document.getElementById('close-results');
    const progressFill = document.getElementById('progress-fill');
    const questionContainer = document.getElementById('question-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-assessment');

    const questions = [
        { 
            id: 'role',
            model: 'CÁ NHÂN', 
            type: 'choice', 
            text: 'Bạn hiện đang là:', 
            options: ['Học sinh', 'Sinh viên', 'Người đi làm'] 
        },
        // Conditional: Student
        { 
            id: 'subjects',
            model: 'HỌC TẬP', 
            type: 'text', 
            text: 'Các môn học bạn thấy mình học tốt là gì?',
            condition: (ans) => ans.role === 'Học sinh'
        },
        // Conditional: Student/Student
        { 
            id: 'major',
            model: 'CHUYÊN NGÀNH', 
            type: 'text', 
            text: 'Bạn đang học ngành gì?',
            condition: (ans) => ans.role === 'Sinh viên'
        },
        // Conditional: Professional
        { 
            id: 'position',
            model: 'CÔNG VIỆC', 
            type: 'text', 
            text: 'Bạn đã/ đang ở vị trí công việc nào?',
            condition: (ans) => ans.role === 'Người đi làm'
        },
        { 
            id: 'education',
            model: 'HỌC VẤN', 
            type: 'choice', 
            text: 'Trình độ học vấn cao nhất của bạn:',
            options: ['Tiểu học', 'THCS', 'THPT', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'],
            condition: (ans) => ans.role === 'Người đi làm'
        },
        // General Questions
        { 
            id: 'skills',
            model: 'KỸ NĂNG', 
            type: 'text', 
            text: 'Bạn có những kĩ năng nổi bật nào?'
        },
        { 
            id: 'experience',
            model: 'KINH NGHIỆM', 
            type: 'text', 
            text: 'Mô tả ngắn gọn về kinh nghiệm của bạn:',
            condition: (ans) => ans.role !== 'Học sinh'
        },
        { 
            id: 'tasks',
            model: 'NHIỆM VỤ', 
            type: 'text', 
            text: 'Các nhiệm vụ công việc chính bạn đã từng thực hiện?',
            condition: (ans) => ans.role !== 'Học sinh'
        },
        { 
            id: 'interests',
            model: 'QUAN TÂM', 
            type: 'text', 
            text: 'Bạn có mối quan tâm đặc biệt với các lĩnh vực nào?'
        }
    ];

    let currentQuestionIndex = 0;
    let userAnswers = {};

    function getVisibleQuestions() {
        return questions.filter(q => !q.condition || q.condition(userAnswers));
    }

    const openAssessment = () => {
        assessmentOverlay.classList.add('active');
        currentQuestionIndex = 0;
        userAnswers = {};
        showQuestion();
    };

    if (startNavBtn) {
        startNavBtn.addEventListener('click', () => {
            if (startNavBtn.dataset.action === 'scroll') {
                if (featuresSection) featuresSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                openAssessment();
            }
        });
    }

    if (footerStartBtn) footerStartBtn.addEventListener('click', openAssessment);

    if (closeAssessment) closeAssessment.addEventListener('click', () => assessmentOverlay.classList.remove('active'));
    if (closeResults) closeResults.addEventListener('click', () => resultsOverlay.classList.remove('active'));

    function showQuestion() {
        const visibleQuestions = getVisibleQuestions();
        const q = visibleQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (questionContainer) {
            let content = `
                <div style="animation: slideIn 0.3s ease-out">
                    <span class="category-badge">${q.model}</span>
                    <h2 class="question-text">${q.text}</h2>
                    <div class="content-area">`;

            if (q.type === 'choice') {
                content += `
                    <div class="options-container">
                        ${q.options.map((opt, i) => `
                            <div class="choice-item ${userAnswers[q.id] === opt ? 'selected' : ''}" data-value="${opt}">
                                <span class="choice-label">${opt}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content += `
                    <textarea class="neo-input" placeholder="Nhập câu trả lời của bạn tại đây..." id="ans-${q.id}">${userAnswers[q.id] || ''}</textarea>
                `;
            }

            content += `</div></div>`;
            questionContainer.innerHTML = content;

            // Choice Listeners
            questionContainer.querySelectorAll('.choice-item').forEach(item => {
                item.addEventListener('click', () => {
                    const val = item.getAttribute('data-value');
                    userAnswers[q.id] = val;
                    
                    // Highlight selected
                    questionContainer.querySelectorAll('.choice-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');

                    // Auto-advance for choice
                    setTimeout(() => {
                        if (currentQuestionIndex < visibleQuestions.length - 1) {
                            currentQuestionIndex++;
                            showQuestion();
                        }
                    }, 400);
                });
            });

            // Text Listeners
            const textInput = questionContainer.querySelector('.neo-input');
            if (textInput) {
                textInput.addEventListener('input', (e) => {
                    userAnswers[q.id] = e.target.value;
                });
            }
        }

        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = currentQuestionIndex === visibleQuestions.length - 1 ? 'BẮT ĐẦU KHÁM PHÁ' : 'TIẾP THEO';

        const navGroup = document.querySelector('.assessment-nav');
        if (navGroup) {
            navGroup.style.display = currentQuestionIndex === 0 ? 'none' : 'flex';
        }
    }

    function getLabel(val) {
        return ['Rất không đồng ý', 'Không đồng ý', 'Trung lập', 'Đồng ý', 'Rất đồng ý'][val - 1];
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        const visibleQuestions = getVisibleQuestions();
        const currentQ = visibleQuestions[currentQuestionIndex];
        
        if (!userAnswers[currentQ.id]) {
            alert('Vui lòng hoàn thành câu trả lời!');
            return;
        }

        if (currentQuestionIndex < visibleQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            // Lưu thông tin cá nhân từ bài test nhanh vào localStorage
            localStorage.setItem('keyreer_profile', JSON.stringify(userAnswers));
            // Chuyển hướng sang trang Step 2
            window.location.href = '../Step 2/index.html';
        }
    });

    function showResults() {
        assessmentOverlay.classList.remove('active');
        resultsOverlay.classList.add('active');

        const chartContainer = document.getElementById('results-content');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="results-summary">
                    ${Object.entries(userAnswers).map(([id, val]) => {
                        const q = questions.find(q => q.id === id);
                        return `
                            <div class="summary-item">
                                <span class="summary-label">${q.text}</span>
                                <p class="summary-value">${val}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }

    function renderChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        Object.entries(data).forEach(([key, val]) => {
            const h = (val / 5) * 100;
            const bar = document.createElement('div');
            bar.style.flex = "1";
            bar.style.display = "flex";
            bar.style.flexDirection = "column";
            bar.style.alignItems = "center";
            bar.style.justifyContent = "flex-end";
            bar.style.height = "100%";
            bar.innerHTML = `
                <div style="background: var(--primary-pink); border: 2px solid black; width: 100%; height: 0%; transition: height 1s cubic-bezier(0.23, 1, 0.32, 1); min-height: 10px;"></div>
                <span style="font-size: 0.6rem; font-weight: 800; margin-top: 5px; transform: rotate(-45deg); white-space: nowrap;">${key}</span>
            `;
            container.appendChild(bar);
            setTimeout(() => {
                bar.firstElementChild.style.height = `${h}%`;
            }, 100);
        });
    }

    // --- Background Scroll Transition (Ultra Smooth) ---
    const bgLayers = {
        'quote-section': document.getElementById('bg-hero-layer'),
        'features': document.getElementById('bg-features-layer'),
        'steps': document.getElementById('bg-steps-layer')
    };

    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.className.split(' ')[0];

                // Set active layer to opacity 1, others to 0
                Object.keys(bgLayers).forEach(key => {
                    if (bgLayers[key]) {
                        const isActive = (key === sectionId);
                        bgLayers[key].style.opacity = isActive ? '1' : '0';

                        // Handle Background Layer Opacity Only
                        if (isActive) {
                            bgLayers[key].style.opacity = '1';
                        }
                    }
                });
            }
        });
    }, { threshold: 0.1 });

    // Target the sections
    const heroSection = document.querySelector('.quote-section');
    if (heroSection) bgObserver.observe(heroSection);
    if (featuresSection) bgObserver.observe(featuresSection);
    if (stepsSection) bgObserver.observe(stepsSection);

    if (restartBtn) restartBtn.addEventListener('click', () => {
        resultsOverlay.classList.remove('active');
        openAssessment();
    });
});
