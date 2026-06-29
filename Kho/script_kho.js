document.addEventListener("DOMContentLoaded", function() {

    // =========================================================
    // 1. TỔNG HỢP CÁC DOM ELEMENTS TRONG CÁC MỤC
    // =========================================================
    const globalInput = document.getElementById('global-area');
    const globalCalcBtn = document.getElementById('global-calc-btn');
    const globalResetBtn = document.getElementById('global-reset-btn');
    const globalError = document.getElementById('global-error');

    // DOM Mục I
    const resMuc1 = document.getElementById('res-muc1');
    
    // DOM Mục III
    const resMuc3Text = document.getElementById('res-muc3-text');
    const tableNhom1 = document.getElementById('table-nhom1');
    const tableNhom2 = document.getElementById('table-nhom2');
    const hosoNote = document.getElementById('hoso-note');

    // DOM Mục IV
    const tableThietBiResult = document.getElementById('table-thietbi-result');
    const thietBiHeader = document.getElementById('thietbi-table-header');
    const thietBiTbody = document.getElementById('thietbi-tbody');

    // DOM Mục V
    const resMuc5 = document.getElementById('res-muc5');
    const ccdcTableWrap = document.getElementById("ccdcTableWrap");
    const reqMsgs = document.querySelectorAll('.require-area-msg');

    // =========================================================
    // 2. CÁC HÀM CẬP NHẬT TỪNG MỤC DỰA TRÊN DIỆN TÍCH
    // =========================================================

    // Cập nhật Mục I
    function updateMuc1(area) {
        resMuc1.style.display = 'block';
        if (area >= 2000) {
            resMuc1.innerHTML = `<div style="color:#b91c1c; font-size: 16px; margin-bottom: 5px;">
                                    Phân loại: <b style="font-size: 18px;">NHÓM 1</b>
                                 </div>
                                 <div style="color: var(--text);">
                                    Kho có tổng diện tích sàn <b>${area} m²</b> (từ 2.000 m² trở lên).<br>
                                    👉 <b>Thuộc diện BẮT BUỘC phải thực hiện thẩm định thiết kế PCCC</b>.
                                 </div>`;
        } else {
            resMuc1.innerHTML = `<div style="color:#166534; font-size: 16px; margin-bottom: 5px;">
                                    Phân loại: <b style="font-size: 18px;">NHÓM 2</b>
                                 </div>
                                 <div style="color: var(--text);">
                                    Kho có tổng diện tích sàn <b>${area} m²</b> (dưới 2.000 m²).<br>
                                    👉 <b>KHÔNG thuộc diện phải thực hiện thẩm định thiết kế PCCC</b>.
                                 </div>`;
        }
    }

    // Cập nhật Mục III
    function updateMuc3(area) {
        resMuc3Text.style.display = 'block';
        hosoNote.style.display = 'block';
        if (area >= 2000) {
            resMuc3Text.innerHTML = `Với diện tích <b>${area} m²</b> 👉 Kho thuộc <b>NHÓM 1</b>.<br>Bạn hãy xem danh sách các hồ sơ bắt buộc ở bảng đỏ bên dưới:`;
            tableNhom1.style.display = 'block';
            tableNhom2.style.display = 'none';
        } else {
            resMuc3Text.innerHTML = `Với diện tích <b>${area} m²</b> 👉 Kho thuộc <b>NHÓM 2</b>.<br>Bạn hãy xem danh sách các hồ sơ bắt buộc ở bảng xanh bên dưới:`;
            tableNhom1.style.display = 'none';
            tableNhom2.style.display = 'block';
        }
    }

    // Cập nhật Mục IV
    function formatStatus(status) {
        if (status.includes("Không")) return `<span style="color: #ef4444; font-weight: bold;">${status}</span>`;
        if (status.includes("Có")) return `<span style="color: #166534; font-weight: bold;">${status}</span>`;
        return `<b>${status}</b>`;
    }

    function updateMuc4(area) {
        let data = {
            botriBinh: "Có (số lượng tùy theo diện tích)",
            chuaChayTD: "Không",
            baoChayTD: "Không",
            hongNuocTrongNha: "Không",
            hongNuocNgoaiNha: "Có (hoặc áp dụng 2.3.2)",
            phaDoThoSo: "Có",
            loaThongBao: "Bắt buộc nếu kho >= 18.000m² & >= 50 người/tầng",
            truyenTinBaoChay: "Có",
            groupName: "",
            bgColor: "#166534" 
        };

        if (area >= 2000) {
            data.groupName = "NHÓM 1 (Từ 2.000 m² trở lên) - Thuộc diện phải thẩm định";
            data.bgColor = "#b91c1c"; 
            data.botriBinh = "Có (dựa theo bản vẽ thẩm định)";
            data.chuaChayTD = "Có";
            data.baoChayTD = "Có";
            data.hongNuocTrongNha = "Có";
        } else if (area >= 1000) {
            data.groupName = "NHÓM 2 (Từ 1.000 m² đến dưới 2.000 m²)";
            data.chuaChayTD = "Có";
            data.baoChayTD = "Có";
            data.hongNuocTrongNha = "Có";
        } else if (area >= 500) {
            data.groupName = "NHÓM 2 (Từ 500 m² đến dưới 1.000 m²)";
            data.baoChayTD = "Có";
            data.hongNuocTrongNha = "Có";
        } else if (area >= 300) {
            data.groupName = "NHÓM 2 (Từ 300 m² đến dưới 500 m²)";
            data.baoChayTD = "Có";
        } else {
            data.groupName = "NHÓM 2 (Dưới 300 m²)";
        }

        thietBiHeader.style.backgroundColor = data.bgColor;
        thietBiHeader.innerText = "YÊU CẦU TRANG BỊ CHO " + data.groupName.toUpperCase();
        
        thietBiTbody.innerHTML = `
            <tr><td class="center">1</td><td>Bố trí trang bị bình PCCC</td><td class="center">${formatStatus(data.botriBinh)}</td><td>theo TCVN 7435-1</td></tr>
            <tr><td class="center">2</td><td>Hệ thống chữa cháy tự động</td><td class="center">${formatStatus(data.chuaChayTD)}</td><td>Mục 1.5.2 Bảng A.3</td></tr>
            <tr><td class="center">3</td><td>Hệ thống báo cháy tự động</td><td class="center">${formatStatus(data.baoChayTD)}</td><td>Mục 1.5.2 Bảng A.3</td></tr>
            <tr><td class="center">4</td><td>Hệ thống họng nước trong nhà</td><td class="center">${formatStatus(data.hongNuocTrongNha)}</td><td>Phụ lục B</td></tr>
            <tr><td class="center">5</td><td>Hệ thống họng nước ngoài nhà</td><td class="center">${formatStatus(data.hongNuocNgoaiNha)}</td><td>2.3.2 Cho phép không trang bị nếu cách trụ cấp nước/nguồn nước tự nhiên dưới 400m và đủ lưu lượng. Ngược lại phải trang bị. (Phụ lục C)</td></tr>
            <tr><td class="center">6</td><td>Trang bị dụng cụ phá dỡ thô sơ</td><td class="center">${formatStatus(data.phaDoThoSo)}</td><td>Phụ lục E (Không Phụ thuộc quy mô)</td></tr>
            <tr><td class="center">7</td><td>Hệ thống loa thông báo</td><td class="center">${formatStatus(data.loaThongBao)}</td><td>(Bảng G.1) TCVN 3890</td></tr>
            <tr><td class="center">8</td><td>Lắp đặt thiết bị truyền tin báo cháy</td><td class="center">${formatStatus(data.truyenTinBaoChay)}</td><td></td></tr>
        `;
        tableThietBiResult.style.display = 'block';
    }

    // Cập nhật Mục V
    function updateMuc5(area) {
        const table = [
            { max: 100,  co2: 1, bot: 1 },
            { max: 200,  co2: 1, bot: 2 },
            { max: 300,  co2: 2, bot: 3 },
            { max: 400,  co2: 2, bot: 4 },
            { max: 500,  co2: 3, bot: 5 },
            { max: 600,  co2: 3, bot: 6 },
            { max: 700,  co2: 4, bot: 7 },
            { max: 800,  co2: 4, bot: 8 },
            { max: 900,  co2: 5, bot: 9 },
            { max: 1000, co2: 5, bot: 10 },
            { max: 1100, co2: 6, bot: 11 },
            { max: 1200, co2: 6, bot: 12 },
            { max: 1300, co2: 7, bot: 13 },
            { max: 1400, co2: 7, bot: 14 },
            { max: 1500, co2: 8, bot: 15 },
            { max: 1600, co2: 8, bot: 16 },
            { max: 1700, co2: 9, bot: 17 },
            { max: 1800, co2: 9, bot: 18 },
            { max: 1900, co2: 10, bot: 19 },
            { max: 2000, co2: 10, bot: 20 }
        ];

        resMuc5.style.display = 'block';
        if (area >= 2000) {
            resMuc5.innerHTML = `<div style="color:#b91c1c; font-weight:bold; margin-bottom: 5px;">⚠️ TRƯỜNG HỢP 2: KHO LỚN</div>
                                 <div style="color: var(--text);">Với diện tích <b>${area} m²</b> (từ 2000 m² trở lên), số lượng và chủng loại bình PCCC phải được trang bị đúng theo <b>Bản vẽ thiết kế PCCC đã được Thẩm duyệt & Phê duyệt</b>. Không áp dụng mức tính trung bình.</div>`;
        } else {
            const row = table.find(item => area <= item.max);
            resMuc5.innerHTML = `<div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255, 77, 0, .35);">
                                    Với diện tích: <b>${area} m²</b> 👉 Áp dụng <b>Trường hợp 1</b>
                                 </div>
                                 <ul style="padding-left: 20px; margin: 0; line-height: 1.8; color: #166534; font-weight: 500;">
                                    <li>Bình bột <b>MFZ8 (8kg)</b>: <b>${row.bot}</b> bình</li>
                                    <li>Bình khí <b>CO2 MT5 (5kg)</b> (Dự trữ tối thiểu 5%): <b>${row.co2}</b> bình</li>
                                 </ul>`;
        }
    }
    function updateCCDC(area){

        ccdcTableWrap.style.display = "block";

        const showTH1 = area >= 2000;

        document.querySelectorAll(".th1-col").forEach(cell=>{
            cell.style.display = showTH1 ? "" : "none";
        });

        document.querySelectorAll(".th2-col").forEach(cell=>{
            cell.style.display = showTH1 ? "none" : "";
        });

    }
    // =========================================================
    // 3. ĐIỀU PHỐI (ORCHESTRATOR)
    // =========================================================
    function hideAllResults() {
        resMuc1.style.display = 'none';
        resMuc3Text.style.display = 'none';
        tableNhom1.style.display = 'none';
        tableNhom2.style.display = 'none';
        hosoNote.style.display = 'none';
        tableThietBiResult.style.display = 'none';
        resMuc5.style.display = 'none';
        ccdcTableWrap.style.display = 'none';
        reqMsgs.forEach(msg => msg.style.display = 'block');
    }

    function processGlobalSearch() {
        const raw = globalInput.value.trim();
        const area = Number(raw);

        if (raw === '' || !isFinite(area) || area < 0) {
            globalInput.classList.add('isError');
            globalError.style.display = 'block';
            globalError.innerText = 'Lỗi: Vui lòng nhập diện tích hợp lệ.';
            hideAllResults();
            return;
        }

        globalInput.classList.remove('isError');
        globalError.style.display = 'none';
        
        // Ẩn các dòng chữ nhắc nhở "Vui lòng nhập diện tích..."
        reqMsgs.forEach(msg => msg.style.display = 'none');

        // Gọi các hàm xử lý
        updateMuc1(area);
        updateMuc3(area);
        updateMuc4(area);
        updateMuc5(area);
        updateCCDC(area);
    }

    if (globalCalcBtn) {
        globalCalcBtn.addEventListener('click', processGlobalSearch);
        globalInput.addEventListener('keydown', function(e){
            if(e.key === 'Enter') processGlobalSearch();
        });
        
        globalResetBtn.addEventListener('click', function(){
            globalInput.value = '';
            globalInput.classList.remove('isError');
            globalError.style.display = 'none';
            hideAllResults();
            globalInput.focus();
        });
    }

    // =========================================================
    // 4. ZOOM HÌNH ẢNH & SCROLL SPY & MOBILE MENU
    // =========================================================
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

        if(btnIn) btnIn.addEventListener('click', () => { if (currentScale < maxScale) { currentScale += scaleStep; img.style.transform = `scale(${currentScale})`; } });
        if(btnOut) btnOut.addEventListener('click', () => { if (currentScale > minScale) { currentScale -= scaleStep; img.style.transform = `scale(${currentScale})`; } });
        if(btnPop) btnPop.addEventListener('click', () => { 
            const imgSrc = img.getAttribute('src');
            if(imgSrc && imgSrc.trim() !== "") window.open(imgSrc, '_blank'); 
            else alert("Hình ảnh chưa được cập nhật.");
        });
        viewer.addEventListener('mouseleave', () => { currentScale = 1; img.style.transform = `scale(1)`; });
    });

    const sections = document.querySelectorAll('main [id]');
    const navLinks = document.querySelectorAll('.toc a');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.toc a[href="#${entry.target.getAttribute('id')}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { root: null, rootMargin: '-100px 0px -60% 0px', threshold: 0 });
    sections.forEach(sec => observer.observe(sec));

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && closeBtn && sidebar) {
        mobileBtn.addEventListener('click', () => sidebar.classList.add('active'));
        closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
        navLinks.forEach(link => {
            link.addEventListener('click', () => { if (window.innerWidth <= 900) sidebar.classList.remove('active'); });
        });
    }
});