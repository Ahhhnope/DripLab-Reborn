<template>
  <div class="promo-page">

    <h2>Phiếu giảm giá</h2>

    <!-- Filter -->
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
      <input type="date" v-model="fromDate" />
      <input type="date" v-model="toDate" />
      <button @click="filterVoucher">Lọc</button>
      <button @click="resetFilter">Xóa lọc</button>
      <button @click="openAddModal">+ Thêm voucher</button>
    </div>

    <!-- Table -->
    <table>
      <colgroup>
        <col style="width:36px">
        <col style="width:44px">
        <col style="width:100px">
        <col style="width:140px">
        <col style="width:85px">
        <col style="width:80px">
        <col style="width:65px">   <!-- SL -->
        <col style="width:115px">  <!-- Đơn tối thiểu -->
        <col style="width:105px">
        <col style="width:105px">
        <col style="width:90px">
        <col style="width:130px">
      </colgroup>

      <thead>
        <tr>
          <th></th>
          <th>STT</th>
          <th>Mã</th>
          <th>Tên</th>
          <th>Loại</th>
          <th>Giá trị</th>
          <th>SL</th>
          <th>Đơn tối thiểu</th>
          <th>Ngày bắt đầu</th>
          <th>Ngày kết thúc</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(v, i) in paginatedVouchers" :key="v.id">
          <td><input type="checkbox" /></td>
          <td>{{ (currentPage - 1) * 8 + i + 1 }}</td>
          <td>{{ v.code }}</td>
          <td>{{ v.name }}</td>
          <td>{{ v.type }}</td>
          <td>{{ v.value }}</td>
          <td>{{ v.quantity }}</td>
          <td>
            {{ v.minOrderValue > 0
              ? (+v.minOrderValue).toLocaleString('vi-VN') + 'đ'
              : '—' }}
          </td>
          <td>{{ v.start }}</td>
          <td>{{ v.end }}</td>
          <td>
            <span :class="['status-badge',
              v.status === 'HOẠT ĐỘNG' ? 'active' : 'expired']">
              {{ v.status }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn"   @click="editVoucher(v)">Sửa</button>
              <button class="delete-btn" @click="deleteVoucher(v.id)">Xóa</button>
            </div>
          </td>
        </tr>

        <!-- Dòng trống giữ chiều cao bảng -->
        <tr v-for="n in (8 - paginatedVouchers.length)"
            :key="'e'+n" class="empty-row">
          <td v-for="c in 12" :key="c"></td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">&lt;</button>
      <button v-for="p in totalPages" :key="p"
              @click="currentPage = p"
              :class="{ active: currentPage === p }">{{ p }}</button>
      <button @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
    </div>


    <!-- ══════════ MODAL THÊM ══════════ -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal-box">
        <h3>Thêm Voucher Mới</h3>
        <div class="modal-form">

          <div class="form-group">
            <label>Mã khuyến mãi <span class="required">*</span></label>
            <input v-model="addForm.code"
                   placeholder="VD: SUMMER20"
                   style="text-transform:uppercase" />
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
            <input v-model="addForm.value" type="number" min="0"
                   :placeholder="addForm.category === 'PHẦN TRĂM'
                     ? 'VD: 10 (= 10%)' : 'VD: 50000 (= 50.000đ)'" />
          </div>

          <!-- SL — MỚI -->
          <div class="form-group">
            <label>Số lượng mã <span class="required">*</span></label>
            <input v-model="addForm.quantity" type="number" min="1"
                   placeholder="VD: 100" />
          </div>

          <!-- Đơn tối thiểu — MỚI -->
          <div class="form-group">
            <label>Đơn tối thiểu (đ)</label>
            <input v-model="addForm.minOrderValue" type="number" min="0"
                   placeholder="Để 0 nếu không giới hạn" />
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
          <button class="save-btn"   @click="saveAdd">Thêm</button>
          <button class="cancel-btn" @click="closeAddModal">Hủy</button>
        </div>
      </div>
    </div>
    <!-- ════════════════════════════════ -->


    <!-- ══════════ MODAL SỬA ══════════ -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="closeModal">
      <div class="modal-box">
        <h3>Chỉnh sửa Voucher</h3>
        <div class="modal-form">

          <div class="form-group">
            <label>Mã khuyến mãi</label>
            <input v-model="editForm.code" />
          </div>

          <div class="form-group">
            <label>Tên khuyến mãi</label>
            <input v-model="editForm.name" />
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
            <input v-model="editForm.value" type="number" min="0" />
          </div>

          <!-- SL — MỚI -->
          <div class="form-group">
            <label>Số lượng mã</label>
            <input v-model="editForm.quantity" type="number" min="0" />
          </div>

          <!-- Đơn tối thiểu — MỚI -->
          <div class="form-group">
            <label>Đơn tối thiểu (đ)</label>
            <input v-model="editForm.minOrderValue" type="number" min="0"
                   placeholder="Để 0 nếu không giới hạn" />
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
          <button class="save-btn"   @click="saveEdit">Lưu</button>
          <button class="cancel-btn" @click="closeModal">Hủy</button>
        </div>
      </div>
    </div>
    <!-- ════════════════════════════════ -->


    <!-- Toast -->
    <div class="toast-notification"
         :class="[toast.type, { show: toast.show }]">
      {{ toast.message }}
    </div>

  </div>
</template>

<script>
import voucher from "../JS/CustomerVoucher.js"
export default voucher
</script>

<style src="../CSS/CustomerVoucher.css"></style>