<template>
  <div class="promo-page">

    <h2>Quản Lý Khuyến Mãi</h2>

    <!-- ══════════ FILTER ══════════ -->
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
      </select>

      <input type="date" v-model="fromDate" />
      <input type="date" v-model="toDate" />

      <button @click="filterVoucher">Lọc</button>
      <button @click="resetFilter">Xóa lọc</button>
      <button @click="openAddModal">+ Thêm voucher</button>
    </div>

    <!-- ══════════ TABLE ══════════ -->
    <div class="table-wrapper">
      <table>
        <colgroup>
          <col style="width:36px">
          <col style="width:44px">
          <col style="width:100px">
          <col style="width:130px">
          <col style="width:82px">
          <col style="width:76px">
          <col style="width:55px">
          <col style="width:110px">
          <col style="width:95px">
          <col style="width:100px">
          <col style="width:100px">
          <col style="width:90px">
          <col style="width:130px">
        </colgroup>

        <thead>
          <tr>
            <th>STT</th>
            <th>Mã</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>SL</th>
            <th>Đơn tối thiểu</th>
            <th>Hiện ở</th>
            <th>Điểm đổi</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(v, i) in paginatedVouchers" :key="v.id">
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
            <td>
              <span :class="['location-badge',
                v.displayLocation === 'online + offline' ? 'web' : 'reward']">
                {{ v.displayLocation }}
              </span>
            </td>
            <td>
              <span v-if="v.displayLocation == 'đổi thưởng'" placeholder="0">{{ v.pointCost }}</span>
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
                <button class="edit-btn" @click="editVoucher(v)">Sửa</button>
                <button class="delete-btn" v-if="v.status" @click="switchStatusVoucher(v.id)">Tắt</button>
                <button class="delete-btn" v-if="!v.status" @click="switchStatusVouchers(v.id)">Bật</button>
              </div>
            </td>
          </tr>

          <!-- Dòng trống giữ chiều cao bảng -->
          <tr v-for="n in (8 - paginatedVouchers.length)" :key="'e' + n" class="empty-row">
            <td v-for="c in 13" :key="c"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════ PAGINATION ══════════ -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">&lt;</button>
      <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="{ active: currentPage === p }">
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages">&gt;</button>
    </div>


    <!-- ══════════ MODAL THÊM ══════════ -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="closeAddModal">
      <div class="modal-box">
        <h3>Thêm Voucher Mới</h3>

        <div class="modal-form">

          <div class="form-group">
            <label>Mã khuyến mãi <span class="required">*</span></label>
            <input v-model="addForm.code" placeholder="VD: SUMMER20" style="text-transform:uppercase" />
          </div>

          <div class="form-group">
            <label>Tên khuyến mãi <span class="required">*</span></label>
            <input v-model="addForm.name" placeholder="Nhập tên khuyến mãi" />
          </div>

          <div class="form-group">
            <label>Loại</label>
            <select v-model="addForm.category">
              <option value="PHẦN TRĂM">Phần trăm (%)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Giá trị <span class="required">*</span></label>
            <input v-model="addForm.value" type="number" min="0" :placeholder="addForm.category === 'PHẦN TRĂM'
              ? 'VD: 10 (= 10%)' : 'VD: 50000 (= 50.000đ)'" />
          </div>

          <div class="form-group">
            <label>Số lượng mã <span class="required">*</span></label>
            <input v-model="addForm.quantity" type="number" min="1" placeholder="VD: 100" />
          </div>

          <div class="form-group">
            <label>Đơn tối thiểu (đ)</label>
            <input v-model="addForm.minOrderValue" type="number" min="0" placeholder="Để 0 nếu không giới hạn" />
          </div>

          <div class="form-group">
            <label>Hiện ở</label>
            <select v-model="addForm.displayLocation">
              <option value="online + offline">Online + Offline</option>
              <option value="đổi thưởng">Đổi thưởng</option>
            </select>
          </div>

          <div class="form-group" v-if="addForm.displayLocation == 'đổi thưởng'">
            <label>Số điểm cần để đổi</label>
            <input v-model="addForm.pointCost" type="number" min="0" placeholder="số điểm cần để đổi" />
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


    <!-- ══════════ MODAL SỬA ══════════ -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="closeModal">
      <div class="modal-box">
        <h3>Chỉnh sửa Voucher</h3>

        <div class="modal-form">

          <div class="form-group">
            <label>Mã khuyến mãi</label>
            <input v-model="editForm.code" style="text-transform:uppercase" />
          </div>

          <div class="form-group">
            <label>Tên khuyến mãi</label>
            <input v-model="editForm.name" />
          </div>

          <div class="form-group">
            <label>Loại</label>
            <select v-model="editForm.category">
              <option value="PHẦN TRĂM">Phần trăm (%)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Giá trị</label>
            <input v-model="editForm.value" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Số lượng mã</label>
            <input v-model="editForm.quantity" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Đơn tối thiểu (đ)</label>
            <input v-model="editForm.minOrderValue" type="number" min="0" placeholder="Để 0 nếu không giới hạn" />
          </div>

          <div class="form-group">
            <label>Hiện ở</label>
            <select v-model="editForm.displayLocation">
              <option value="online + offline">Online + Offline</option>
              <option value="đổi thưởng">Đổi thưởng</option>
            </select>
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


    <!-- ══════════ TOAST ══════════ -->
    <div class="toast-notification" :class="[toast.type, { show: toast.show }]">
      {{ toast.message }}
    </div>

  </div>
</template>

<script>
import voucher from "../JS/CustomerVoucher.js"
export default voucher
</script>

<style src="../CSS/CustomerVoucher.css" scoped></style>