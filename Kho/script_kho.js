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
                foot = '<div class="toolFoot" style="margin-top: 10px; font-size: 13px; color: var(--muted); font-style: italic;">*Theo Trường hợp 1, CO2 dự trữ tối thiểu 5% số bình bột.</div>';
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
    /* =========================================================
       X. LOGIC CHO CÔNG CỤ PHÂN LOẠI NHÓM PCCC
       ========================================================= */
    const toolPhanLoai = document.querySelector('[data-tool="phan-loai-kho"]');
    if(toolPhanLoai) {
        const inputArea = toolPhanLoai.querySelector('.input-phan-loai');
        const btnCalc = toolPhanLoai.querySelector('.btn-calc-phan-loai');
        const divResult = toolPhanLoai.querySelector('.result-phan-loai');

        function checkGroup() {
            const raw = String(inputArea.value || '').trim();
            const area = Number(raw);

            if (raw === '' || !isFinite(area) || area < 0) {
                inputArea.classList.add('isError');
                divResult.style.display = 'block';
                divResult.innerHTML = '<b style="color:#ef4444">Lỗi:</b> Vui lòng nhập diện tích hợp lệ.';
                return;
            }

            inputArea.classList.remove('isError');
            divResult.style.display = 'block';

            let resultHtml = '';
            if (area >= 2000) {
                resultHtml = `<div style="color:#b91c1c; font-size: 16px; margin-bottom: 5px;">
                                Phân loại: <b>NHÓM 1</b>
                              </div>
                              <div style="color: var(--text);">
                                Kho có tổng diện tích sàn <b>${area} m²</b> (từ 2.000 m² trở lên).<br>
                                👉 <b>Thuộc diện BẮT BUỘC phải thẩm định thiết kế PCCC</b>.
                              </div>`;
            } else {
                resultHtml = `<div style="color:#166534; font-size: 16px; margin-bottom: 5px;">
                                Phân loại: <b>NHÓM 2</b>
                              </div>
                              <div style="color: var(--text);">
                                Kho có tổng diện tích sàn <b>${area} m²</b> (dưới 2.000 m²).<br>
                                👉 <b>KHÔNG thuộc diện phải thẩm định thiết kế PCCC</b>.
                              </div>`;
            }

            divResult.innerHTML = resultHtml;
        }

        // Bấm nút kiểm tra
        btnCalc.addEventListener('click', checkGroup);
        
        // Ấn Enter trong ô nhập số
        inputArea.addEventListener('keydown', function(e){
            if(e.key === 'Enter') checkGroup();
        });
    }
    /* =========================================================
       Y. LOGIC CHO BẢNG HỒ SƠ ĐỘNG (HIỆN BẢNG THEO NHÓM 1 HAY 2)
       ========================================================= */
    const toolHoSo = document.querySelector('[data-tool="hoso-pccc"]');
    if (toolHoSo) {
        const inputHoSo = toolHoSo.querySelector('.input-hoso');
        const btnHoSo = toolHoSo.querySelector('.btn-calc-hoso');
        const resHoSo = toolHoSo.querySelector('.result-hoso');
        
        const tableNhom1 = document.getElementById('table-nhom1');
        const tableNhom2 = document.getElementById('table-nhom2');
        const hosoNote = document.getElementById('hoso-note');

        function showHoSoTable() {
            const raw = String(inputHoSo.value || '').trim();
            const area = Number(raw);

            // Kiểm tra lỗi nhập
            if (raw === '' || !isFinite(area) || area < 0) {
                inputHoSo.classList.add('isError');
                resHoSo.style.display = 'block';
                resHoSo.innerHTML = '<b style="color:#ef4444">Lỗi:</b> Vui lòng nhập diện tích hợp lệ.';
                tableNhom1.style.display = 'none';
                tableNhom2.style.display = 'none';
                hosoNote.style.display = 'none';
                return;
            }

            // Hợp lệ, tiến hành ẩn hiện bảng
            inputHoSo.classList.remove('isError');
            resHoSo.style.display = 'block';
            hosoNote.style.display = 'block';

            if (area >= 2000) {
                // Nhóm 1
                resHoSo.innerHTML = `Diện tích: <b>${area} m²</b> 👉 Kho thuộc <b>NHÓM 1</b> (Thuộc diện phải thẩm định).<br>Bạn hãy xem các hồ sơ cần thiết ở bảng dưới đây:`;
                tableNhom1.style.display = 'block';
                tableNhom2.style.display = 'none';
            } else {
                // Nhóm 2
                resHoSo.innerHTML = `Diện tích: <b>${area} m²</b> 👉 Kho thuộc <b>NHÓM 2</b> (Không thuộc diện thẩm định).<br>Bạn hãy xem các hồ sơ cần thiết ở bảng dưới đây:`;
                tableNhom1.style.display = 'none';
                tableNhom2.style.display = 'block';
            }
        }

        btnHoSo.addEventListener('click', showHoSoTable);
        inputHoSo.addEventListener('keydown', function(e){
            if(e.key === 'Enter') showHoSoTable();
        });
    }
    /* =========================================================
       Z. LOGIC CHO BẢNG YÊU CẦU TRANG BỊ HỆ THỐNG PCCC (MỤC IV)
       ========================================================= */
    const toolTB = document.querySelector('[data-tool="thiet-bi-pccc"]');
    if (toolTB) {
        const inputTB = toolTB.querySelector('.input-thiet-bi');
        const btnTB = toolTB.querySelector('.btn-calc-thiet-bi');
        const resTB = toolTB.querySelector('.result-thiet-bi');
        const tableContainer = document.getElementById('table-thietbi-result');
        const tableHeader = document.getElementById('thietbi-table-header');
        const tbody = document.getElementById('thietbi-tbody');

        // Hàm quyết định các thông số dựa vào diện tích
        function getThietBiData(area) {
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
                bgColor: "#166534" // Màu xanh lá cho nhóm 2
            };

            if (area >= 2000) {
                // NHÓM 1: Từ 2000m2 trở lên
                data.groupName = "NHÓM 1 (Từ 2.000 m² trở lên) - Thuộc diện phải thẩm định";
                data.bgColor = "#b91c1c"; // Màu đỏ cho nhóm 1
                data.botriBinh = "Có (dựa theo bản vẽ thẩm định)";
                data.chuaChayTD = "Có";
                data.baoChayTD = "Có";
                data.hongNuocTrongNha = "Có";
            } else if (area >= 1000) {
                // Từ 1000m2 đến dưới 2000m2
                data.groupName = "NHÓM 2 (Từ 1.000 m² đến dưới 2.000 m²)";
                data.chuaChayTD = "Có";
                data.baoChayTD = "Có";
                data.hongNuocTrongNha = "Có";
            } else if (area >= 500) {
                // Từ 500m2 đến dưới 1000m2
                data.groupName = "NHÓM 2 (Từ 500 m² đến dưới 1.000 m²)";
                data.baoChayTD = "Có";
                data.hongNuocTrongNha = "Có";
            } else if (area >= 300) {
                // Từ 300m2 đến dưới 500m2
                data.groupName = "NHÓM 2 (Từ 300 m² đến dưới 500 m²)";
                data.baoChayTD = "Có";
            } else {
                // Dưới 300m2
                data.groupName = "NHÓM 2 (Dưới 300 m²)";
            }

            return data;
        }

        // Hàm render màu cho cột Có/Không
        function formatStatus(status) {
            if (status.includes("Không")) return `<span style="color: #ef4444; font-weight: bold;">${status}</span>`;
            if (status.includes("Có")) return `<span style="color: #166534; font-weight: bold;">${status}</span>`;
            return `<b>${status}</b>`;
        }

        function renderTable() {
            const raw = String(inputTB.value || '').trim();
            const area = Number(raw);

            // Xóa thông báo lỗi trước đó
            inputTB.classList.remove('isError');
            
            if (raw === '' || !isFinite(area) || area < 0) {
                inputTB.classList.add('isError');
                resTB.style.display = 'block';
                resTB.innerHTML = '<b style="color:#ef4444">Lỗi:</b> Vui lòng nhập diện tích hợp lệ.';
                tableContainer.style.display = 'none';
                return;
            }

            // Lấy data dựa trên diện tích
            const tbData = getThietBiData(area);

            // Cập nhật thông báo
            resTB.style.display = 'block';
            resTB.innerHTML = `Diện tích: <b>${area} m²</b> 👉 Danh mục thiết bị áp dụng cho <b>${tbData.groupName}</b>`;

            // Cập nhật Tiêu đề bảng
            tableHeader.style.backgroundColor = tbData.bgColor;
            tableHeader.innerText = "YÊU CẦU TRANG BỊ CHO " + tbData.groupName.toUpperCase();

            // Render dữ liệu vào tbody
            tbody.innerHTML = `
                <tr><td class="center">1</td><td>Bố trí trang bị bình PCCC</td><td class="center">${formatStatus(tbData.botriBinh)}</td><td>theo TCVN 7435-1</td></tr>
                <tr><td class="center">2</td><td>Hệ thống chữa cháy tự động</td><td class="center">${formatStatus(tbData.chuaChayTD)}</td><td>Mục 1.5.2 Bảng A.3</td></tr>
                <tr><td class="center">3</td><td>Hệ thống báo cháy tự động</td><td class="center">${formatStatus(tbData.baoChayTD)}</td><td>Mục 1.5.2 Bảng A.3</td></tr>
                <tr><td class="center">4</td><td>Hệ thống họng nước trong nhà</td><td class="center">${formatStatus(tbData.hongNuocTrongNha)}</td><td>Phụ lục B</td></tr>
                <tr><td class="center">5</td><td>Hệ thống họng nước ngoài nhà</td><td class="center">${formatStatus(tbData.hongNuocNgoaiNha)}</td><td>2.3.2 Cho phép không trang bị nếu cách trụ cấp nước/nguồn nước tự nhiên (ao, hồ...) dưới 400m và đủ lưu lượng. Ngược lại phải trang bị. (Phụ lục C)</td></tr>
                <tr><td class="center">6</td><td>Trang bị dụng cụ phá dỡ thô sơ</td><td class="center">${formatStatus(tbData.phaDoThoSo)}</td><td>Phụ lục E (Không Phụ thuộc quy mô)</td></tr>
                <tr><td class="center">7</td><td>Hệ thống loa thông báo</td><td class="center">${formatStatus(tbData.loaThongBao)}</td><td>(Bảng G.1) TCVN 3890</td></tr>
                <tr><td class="center">8</td><td>Lắp đặt thiết bị truyền tin báo cháy</td><td class="center">${formatStatus(tbData.truyenTinBaoChay)}</td><td></td></tr>
            `;

            // Hiển thị bảng
            tableContainer.style.display = 'block';
        }

        // Gắn sự kiện click và phím Enter
        btnTB.addEventListener('click', renderTable);
        inputTB.addEventListener('keydown', function(e){
            if(e.key === 'Enter') renderTable();
        });
    }
});