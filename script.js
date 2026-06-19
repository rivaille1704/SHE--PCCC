document.addEventListener("DOMContentLoaded", function() {
    
    /* =========================================================
       1. LOGIC CHO CÔNG CỤ TÍNH SỐ LƯỢNG BÌNH CHỮA CHÁY
       ========================================================= */
    const tool = document.querySelector('[data-tool="v2"]');
    if(tool) {
        const areaEl  = tool.querySelector('.toolArea');
        const calcEl  = tool.querySelector('.toolCalc');
        const resetEl = tool.querySelector('.toolReset');
        const resEl   = tool.querySelector('.toolResult');

        // Hàm làm tròn số
        function roundInt(x){ return Math.round(x); }

        // Logic tính toán (Trích xuất nguyên bản từ file gốc)
        function calcByArea(area){
            const powder8 = Math.max(1, Math.ceil(area / 100)); // Cứ 100m2 = 1 bình bột MFZ8
            const co2_5   = roundInt(powder8 * 0.5);            // Bình CO2 = 50% số bình bột
            const co2Reserve10 = Math.ceil(powder8 * 0.10);     // Dự trữ 10%
            return { powder8, co2_5, co2Reserve10 };
        }

        // Hàm hiển thị lỗi nếu người dùng nhập sai
        function showError(msg){
            areaEl.classList.add('isError');
            resEl.style.display = 'block';
            resEl.innerHTML = '<b style="color:#ef4444">Lỗi:</b> ' + msg;
        }

        // Hàm in kết quả ra màn hình
        function showResult(area, r){
            areaEl.classList.remove('isError');
            const isCase2 = area >= 2000;
            
            const meta = '<div class="toolMeta">' +
                'Diện tích: <b>' + area + '</b> m² &nbsp;•&nbsp; ' +
                'Gợi ý áp dụng: <b>' + (isCase2 ? 'Trường hợp 2 (≥ 2000 m²)' : 'Trường hợp 1 (&lt; 2000 m²)') + '</b></div>';

            const list = '<ul class="toolList">' +
                '<li>Bình bột <b>MFZ8 (8kg)</b>: <b>' + r.powder8 + '</b></li>' +
                '<li>Bình khí <b>CO2 MT5 (5kg)</b>: <b>' + r.co2_5 + '</b></li></ul>';

            const foot = isCase2
                ? '<div class="toolFoot">*Kho ≥ 2000 m²: số lượng/chủng loại/vị trí bình chữa cháy ưu tiên theo <b>bản vẽ thiết kế PCCC</b> đã thẩm duyệt &amp; phê duyệt.</div>'
                : '<div class="toolFoot">*Theo Trường hợp 1, CO2 dự trữ tối thiểu 10% số bình bột: <b>' + r.co2Reserve10 + '</b> bình (tham chiếu nội bộ).</div>';

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
        
        // Cho phép ấn Enter để tính
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
        const scaleStep = 0.25; // Mỗi lần click tăng/giảm 25%
        const maxScale = 3;     // Zoom to tối đa 3 lần
        const minScale = 0.5;   // Thu nhỏ tối đa còn 1 nửa

        // Phóng to
        if(btnIn) {
            btnIn.addEventListener('click', () => {
                if (currentScale < maxScale) {
                    currentScale += scaleStep;
                    img.style.transform = `scale(${currentScale})`;
                }
            });
        }

        // Thu nhỏ
        if(btnOut) {
            btnOut.addEventListener('click', () => {
                if (currentScale > minScale) {
                    currentScale -= scaleStep;
                    img.style.transform = `scale(${currentScale})`;
                }
            });
        }

        // Pop-out (Mở ảnh trong tab mới)
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

        // Tự động trả ảnh về kích thước gốc khi rê chuột ra khỏi khu vực ảnh
        viewer.addEventListener('mouseleave', () => {
            currentScale = 1;
            img.style.transform = `scale(1)`;
        });
    });

    /* =========================================================
       3. LOGIC GSAP CUBES 3D BACKGROUND (Sử dụng DOM Metrics Fix lỗi tọa độ)
       ========================================================= */
    /* =========================================================
       4. SCROLL SPY (Tự động highlight Mục lục khi cuộn trang)
       ========================================================= */
    function initTableOfContents() {
        const sections = document.querySelectorAll('main [id]');
        const navLinks = document.querySelectorAll('.toc a');

        // Theo dõi xem khối nội dung nào đang lọt vào tầm nhìn của màn hình
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -60% 0px', // Điểm kích hoạt là phần nửa trên màn hình
            threshold: 0
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Xóa class active cũ
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Thêm class active cho mục lục tương ứng
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.toc a[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, observerOptions);

        sections.forEach(sec => observer.observe(sec));
    }
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const allTocLinks = document.querySelectorAll('.toc a');

    if (mobileBtn && closeBtn && sidebar) {
        // 1. Mở Sidebar khi bấm nút "☰ Mục lục"
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });

        // 2. Đóng Sidebar khi bấm nút "×"
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });

        // 3. Tự động đóng Sidebar sau khi người dùng bấm chọn 1 mục
        allTocLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Chỉ tự động đóng nếu đang ở màn hình điện thoại (<= 900px)
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
    initTableOfContents();
    // Kích hoạt background
    initCubesBackground();
});