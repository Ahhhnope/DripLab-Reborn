<template>

    <div class="promo-page">

        <h2>Phiếu giảm giá</h2>

        <div class="filter">

            <input v-model="search" placeholder="Tìm theo mã hoặc tên" />

            <select v-model="status">
                <option value="">Tất cả trạng thái</option>
                <option value="HOẠT ĐỘNG">Hoạt động</option>
                <option value="HẾT HẠN">Hết hạn</option>
            </select>

            <select v-model="type">
                <option value="">Tất cả loại</option>
                <option value="PHẦN TRĂM">Phần trăm</option>
                <option value="TRỪ TIỀN">Trừ tiền</option>
            </select>

            <input type="date" v-model="fromDate">
            <input type="date" v-model="toDate">

            <button @click="filterVoucher">Lọc</button>
            <button @click="resetFilter">Xóa lọc</button>
            <button @click="addVoucher">Thêm voucher</button>

        </div>


        <table>

            <colgroup>
                <col style="width: 40px">
                <col style="width: 50px">
                <col style="width: 120px">
                <col style="width: 150px">
                <col style="width: 100px">
                <col style="width: 90px">
                <col style="width: 80px">
                <col style="width: 120px">
                <col style="width: 120px">
                <col style="width: 100px">
                <col style="width: 140px">
            </colgroup>

            <thead>
                <tr>
                    <th></th>
                    <th>STT</th>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Loại</th>
                    <th>Giá trị</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>

            <tbody>

                <tr v-for="(v, index) in paginatedVouchers" :key="v.id">
                    <td><input type="checkbox"></td>
                    <td>{{ (currentPage - 1) * 8 + index + 1 }}</td>
                    <td>{{ v.code }}</td>
                    <td>{{ v.name }}</td>
                    <td>{{ v.type }}</td>
                    <td>{{ v.value }}</td>
                    <td>{{ v.start }}</td>
                    <td>{{ v.end }}</td>
                    <td>
                        <span :class="['status-badge', v.status === 'HOẠT ĐỘNG' ? 'active' : 'expired']">
                            {{ v.status }}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="edit-btn" @click="editVoucher(v)">Sửa</button>
                        <button class="delete-btn" @click="deleteVoucher(v.id)">Xóa</button>
                    </td>
                </tr>

                <tr v-for="i in (8 - paginatedVouchers.length)" :key="'empty-' + i" class="empty-row">
                    <td></td><td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>

            </tbody>

        </table>


        <div class="pagination">

            <button @click="prevPage" :disabled="currentPage === 1">&lt;</button>

            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                :class="{ active: currentPage === page }">
                {{ page }}
            </button>

            <button @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>

        </div>


        <!-- ========== POPUP THÊM VOUCHER ========== -->
        <div class="modal-overlay" v-if="showAddModal" @click.self="closeAddModal">
            <div class="modal-box">

                <h3>Thêm Voucher Mới</h3>

                <div class="modal-form">

                    <div class="form-group">
                        <label>Mã khuyến mãi <span class="required">*</span></label>
                        <input v-model="addForm.code" placeholder="VD: SUMMER20" style="text-transform:uppercase"/>
                    </div>

                    <div class="form-group">
                        <label>Tên khuyến mãi <span class="required">*</span></label>
                        <input v-model="addForm.name" placeholder="Nhập tên khuyến mãi" />
                    </div>

                    <div class="form-group">
                        <label>Loại</label>
                        <select v-model="addForm.category">
                            <option value="PHẦN TRĂM">Phần trăm (%)</option>
                            <option value="TRỪ TIỀN">Tiền mặt (VNĐ)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Giá trị <span class="required">*</span></label>
                        <input v-model="addForm.value"
                            :placeholder="addForm.category === 'PHẦN TRĂM' ? 'VD: 10 (= 10%)' : 'VD: 50000 (= 50.000đ)'"
                            type="number" min="0" />
                    </div>

                    <div class="form-group">
                        <label>Số lượng</label>
                        <input type="number" v-model="addForm.quantity" min="1" />
                    </div>

                    <div class="form-group">
                        <label>Ngày bắt đầu <span class="required">*</span></label>
                        <input type="date" v-model="addForm.start" />
                    </div>

                    <div class="form-group">
                        <label>Ngày kết thúc <span class="required">*</span></label>
                        <input type="date" v-model="addForm.end" />
                    </div>

                </div>

                <div class="modal-actions">
                    <button class="save-btn" @click="saveAdd">Thêm</button>
                    <button class="cancel-btn" @click="closeAddModal">Hủy</button>
                </div>

            </div>
        </div>
        <!-- =========================================== -->


        <!-- ========== POPUP SỬA VOUCHER ========== -->
        <div class="modal-overlay" v-if="showEditModal" @click.self="closeModal">
            <div class="modal-box">

                <h3>Chỉnh sửa Voucher</h3>

                <div class="modal-form">

                    <div class="form-group">
                        <label>Mã khuyến mãi</label>
                        <input v-model="editForm.code" placeholder="Nhập mã khuyến mãi" />
                    </div>

                    <div class="form-group">
                        <label>Tên khuyến mãi</label>
                        <input v-model="editForm.name" placeholder="Nhập tên khuyến mãi" />
                    </div>

                    <div class="form-group">
                        <label>Loại</label>
                        <select v-model="editForm.category">
                            <option value="PHẦN TRĂM">Phần trăm (%)</option>
                            <option value="TRỪ TIỀN">Tiền mặt (VNĐ)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Giá trị</label>
                        <input v-model="editForm.value" placeholder="VD: 10% hoặc 50000" />
                    </div>

                    <div class="form-group">
                        <label>Ngày bắt đầu</label>
                        <input type="date" v-model="editForm.start" />
                    </div>

                    <div class="form-group">
                        <label>Ngày kết thúc</label>
                        <input type="date" v-model="editForm.end" />
                    </div>

                    <div class="form-group">
                        <label>Trạng thái</label>
                        <select v-model="editForm.status">
                            <option value="HOẠT ĐỘNG">Hoạt động</option>
                            <option value="HẾT HẠN">Hết hạn</option>
                        </select>
                    </div>

                </div>

                <div class="modal-actions">
                    <button class="save-btn" @click="saveEdit">Lưu</button>
                    <button class="cancel-btn" @click="closeModal">Hủy</button>
                </div>

            </div>
        </div>
        <!-- ========================================= -->


        <!-- ========== TOAST THÔNG BÁO ========== -->
        <div class="toast-notification" :class="[toast.type, { show: toast.show }]">
            {{ toast.message }}
        </div>
        <!-- ======================================= -->

    </div>

</template>


<script>
import voucher from "../JS/CustomerVoucher.js"
export default voucher
</script>

<style src="../CSS/CustomerVoucher.css"></style>