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

            <thead>
                <tr>
                    <th></th>
                    <th>STT</th>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Loại</th>
                    <th>Giá trị</th>
                    <th>Số lượng</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>

            <tbody>

                <tr v-for="(v, index) in paginatedVouchers" :key="v.id">

                    <td><input type="checkbox"></td>

                    <td>{{ index + 1 }}</td>
                    <td>{{ v.code }}</td>
                    <td>{{ v.name }}</td>
                    <td>{{ v.type }}</td>
                    <td>{{ v.value }}</td>
                    <td>{{ v.quantity }}</td>
                    <td>{{ v.start }}</td>
                    <td>{{ v.end }}</td>
                    <td>{{ v.status }}</td>

                    <td class="action-buttons">
                        <button class="edit-btn" @click="editVoucher(v)">Sửa</button>
                        <button class="delete-btn" @click="deleteVoucher(v.id)">Xóa</button>
                    </td>

                </tr>

            </tbody>

        </table>


        <div class="pagination">

            <button v-for="page in totalPages" :key="page" @click="currentPage = page">
                {{ page }}
            </button>

        </div>

    </div>

</template>


<script>
import voucher from "../JS/CustomerVoucher.js"
export default voucher
</script>

<style src="../CSS/CustomerVoucher.css"></style>
