document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================================
       1. LOGIC CHO CÔNG CỤ TÍNH SỐ LƯỢNG BÌNH CHỮA CHÁY (CHO KHO)
       ========================================================= */
    const tool = document.querySelector('[data-tool="kho"]');
    if(tool) {
        const areaEl  = tool.querySelector('.toolArea');
        const calcEl  = tool.querySelector('.toolCalc');
        const resetEl = tool.querySelector('.toolReset');
        const resEl   = tool.querySelector('.toolResult');

        // Hàm tính toán dựa trên quy định Kho (100m2 = 1 bình bột MFZ8, 10% CO2 dự phòng)
        function calcByArea(area){
            const powder8 = Math.max(1, Math.ceil(area / 100)); 
            const co2Reserve = Math.max(1, Math.ceil(powder8 * 0.10));     
            return { powder8, co2Reserve };
        }

        // Hàm hiển thị lỗi
        function showError(msg){
            areaEl.classList.add('isError');
            resEl.style.display = 'block';
            resEl.innerHTML = '<b style="color:#ef4444">Lỗi:</b> ' + msg;
        }

        // Hàm in kết quả ra màn hình
        function showResult(area, r){
            areaEl.classList.remove('isError');
            const isCase2 = area >= 2000;
            
            const meta = '<div class="toolMeta" style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255, 77, 0, .35);">' +
                'Diện tích: <b>' + area + '</b> m² &nbsp;•&nbsp; ' +
                'Gợi ý áp dụng: <b>' + (isCase2 ? 'Trường hợp 2 (≥ 2000 m²)' : 'Trường hợp 1 (&lt; 2000 m²)') + '</b></div>';

            let list = '';
            let foot = '';

            if (isCase2) {
                list = '<div style="color:#b91c1c; font-weight:bold; margin-bottom: 5px;">⚠️ TRƯỜNG HỢP 2: KHO LỚN</div>' +
                       '<div style="color: var(--text);">Với diện tích từ 2000 m² trở lên, số lượng và chủng loại bình PCCC phải được trang bị đúng theo <b>Bản vẽ thiết kế PCCC đã được Thẩm duyệt & Phê duyệt</b>. Không áp dụng mức tính trung bình.</div>';
            } else {
                list = '<ul class="toolList" style="padding-left: 20px; margin: 0; line-height: 1.8;">' +
                    '<li>Bình bột <b>MFZ8 (8kg)</b>: <b>' + r.powder8 + '</b> bình</li>' +
                    '<li>Bình khí dự phòng <b>CO2 MT5 (5kg)</b>: <b>' + r.co2Reserve + '</b> bình</li></ul>';
                foot = '<div class="toolFoot" style="margin-top: 10px; font-size: 13px; color: var(--muted); font-style: italic;">*Theo Trường hợp 1, CO2 dự trữ tối thiểu 10% số bình bột.</div>';
            }

            resEl.style.display = 'block';
            resEl.innerHTML = meta + list + foot;
        }

        // Xử lý sự kiện khi bấm nút Tính
        function calc(){
            const raw = String(areaEl.value || '').trim();
            const v = Number(raw);

            if(raw === '' || !isFinite(v) || v < 0){
                showError('Vui lòng nhập diện tích hợp lệ (>= 0).');
                return;
            }

            const area = Math.round(v);
            showResult(area, calcByArea(area));
        }

        calcEl.addEventListener('click', calc);
        
        // Xử lý sự kiện khi bấm nút Reset
        resetEl.addEventListener('click', function(){
            areaEl.value = '';
            areaEl.classList.remove('isError');
            resEl.style.display = 'none';
            resEl.innerHTML = '';
            areaEl.focus();
        });
        
        areaEl.addEventListener('keydown', function(e){
            if(e.key === 'Enter') calc();
        });
    }

    /* =========================================================
       2. LOGIC CHO BỘ ĐIỀU KHIỂN HÌNH ẢNH (ZOOM & POP-OUT)
       ========================================================= */
    const imageViewers = document.querySelectorAll('.custom-viewer');
    
    imageViewers.forEach(viewer => {
        const img = viewer.querySelector('img');
        const btnIn = viewer.querySelector('.btn-zoom-in');
        const btnOut = viewer.querySelector('.btn-zoom-out');
        const btnPop = viewer.querySelector('.btn-pop-out');
        
        if(!img) return;

        let currentScale = 1;
        const scaleStep = 0.25; 
        const maxScale = 3;     
        const minScale = 0.5;   

        if(btnIn) {
            btnIn.addEventListener('click', () => {
                if (currentScale < maxScale) {
                    currentScale += scaleStep;
                    img.style.transform = `scale(${currentScale})`;
                }
            });
        }

        if(btnOut) {
            btnOut.addEventListener('click', () => {
                if (currentScale > minScale) {
                    currentScale -= scaleStep;
                    img.style.transform = `scale(${currentScale})`;
                }
            });
        }

        if(btnPop) {
            btnPop.addEventListener('click', () => {
                const imgSrc = img.getAttribute('src');
                if(imgSrc && imgSrc.trim() !== "") {
                    window.open(imgSrc, '_blank');
                } else {
                    alert("Hình ảnh chưa được cập nhật liên kết.");
                }
            });
        }

        viewer.addEventListener('mouseleave', () => {
            currentScale = 1;
            img.style.transform = `scale(1)`;
        });
    });

    /* =========================================================
       3. SCROLL SPY (Tự động highlight Mục lục khi cuộn trang)
       ========================================================= */
    function initTableOfContents() {
        const sections = document.querySelectorAll('main [id]');
        const navLinks = document.querySelectorAll('.toc a');

        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -60% 0px', 
            threshold: 0
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.toc a[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(sec => observer.observe(sec));
    }
    
    /* =========================================================
       4. MOBILE MENU
       ========================================================= */
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const allTocLinks = document.querySelectorAll('.toc a');

    if (mobileBtn && closeBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });

        allTocLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    initTableOfContents();
    /* Đã gỡ bỏ hàm initCubesBackground theo yêu cầu */
});