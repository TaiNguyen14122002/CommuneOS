<!-- SPDX-FileCopyrightText: 2026 CommuneOS Contributors -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script setup lang="ts">
import { Users,ShieldCheck,Edit3,RefreshCw,Eye,Trash2,Plus,User,Mail,Phone,MapPin,Building,Clock,X,ChevronRight,FileText,IdCard,FileCheck,GraduationCap,Upload,Key,CheckCircle2,CircleX } from 'lucide-vue-next'
import { ref } from 'vue'
import type { Staff, ProfileChangeRequest } from '../types/models'
import { readableError } from '~/composables/useFormat'

interface StaffProfile extends Staff {
  phone?: string
  email?: string
  address?: string
}
const {data:staff,error,refresh}=await useFetch<Staff[]>('/api/staff', {key:'staff-list'})
const busy=ref(false);const result=ref('')
const newUser=ref('');const newName=ref('');const newRole=ref<'officer'|'admin'|'manager'>('officer')

const newGiayKhaiSinh=ref('');const newLyLichTuPhap=ref('')
const newGiaySucKhoe=ref('');const newVanBang=ref('');const newQuyetDinhTuyenDung=ref('')
const newPhuLucLyLich=ref('');const newQuyetDinhNhanSu=ref('');const newDanhGia=ref('');const newKeKhai=ref('')
const newPassword=ref('');const newConfirmPassword=ref('');const newManagerCode=ref('')

const showDetail=ref(false);const showEdit=ref(false);const showDelete=ref(false);const showManagerCode=ref(false)
const managerAuthenticated=ref(false)
const selected=ref<Staff|null>(null)
const managerAccessCode=ref('MQL-ADMIN-001')
const inputManagerCode=ref('')
const managerCodeError=ref('')
const editUser=ref('');const editName=ref('');const editRole=ref<'officer'|'admin'|'manager'>('officer');const editActive=ref(true)
const editGiayKhaiSinh=ref('');const editLyLichTuPhap=ref('')
const editGiaySucKhoe=ref('');const editVanBang=ref('');const editQuyetDinhTuyenDung=ref('')
const editPhuLucLyLich=ref('');const editQuyetDinhNhanSu=ref('');const editDanhGia=ref('');const editKeKhai=ref('')
const editPassword=ref('');const editConfirmPassword=ref('');const editManagerCode=ref('')
const profileChangeRequests=useState<ProfileChangeRequest[]>('profileChangeRequests', () => [])

const demoProfiles:Record<string,StaffProfile>={}

function profileOf(s:Staff):StaffProfile{
  if(demoProfiles[s.id]) return demoProfiles[s.id]
  const p:StaffProfile={...s,phone:'0900 000 000',email:`${s.username}@commune.local`,address:'Phòng quản trị, UBND xã'}
  demoProfiles[s.id]=p
  return p
}

if(!managerAuthenticated.value){
  showManagerCode.value=true
}
const {data:pendingRequests}=await useFetch<ProfileChangeRequest[]>('/api/profile-change-requests',{key:'profile-change-requests'})
if(pendingRequests.value) profileChangeRequests.value=pendingRequests.value

async function createStaff(){
  result.value=''
  if(!newUser.value.trim()||!newName.value.trim()){result.value='Vui lòng nhập đầy đủ tên đăng nhập và họ tên.';return}
  if(!newPassword.value.trim()){result.value='Vui lòng nhập mật khẩu.';return}
  if(newPassword.value.trim()!==newConfirmPassword.value.trim()){result.value='Mật khẩu xác nhận không khớp.';return}
  if(newRole.value==='manager'&&!newManagerCode.value.trim()){result.value='Vai trò Quản lý phải nhập mã quản lý.';return}
  busy.value=true
  try{
    await $fetch('/api/staff',{method:'POST',body:{username:newUser.value.trim(),display_name:newName.value.trim(),role:newRole.value,password:newPassword.value.trim(),managerCode:newRole.value==='manager'?newManagerCode.value.trim():undefined,giayKhaiSinh:newGiayKhaiSinh.value.trim(),lyLichTuPhap:newLyLichTuPhap.value.trim(),giaySucKhoe:newGiaySucKhoe.value.trim(),vanBangChungChi:newVanBang.value.trim(),quyetDinhTuyenDung:newQuyetDinhTuyenDung.value.trim(),phuLucLyLich:newPhuLucLyLich.value.trim(),quyetDinhNhanSu:newQuyetDinhNhanSu.value.trim(),danhGiaKiemDiem:newDanhGia.value.trim(),keKhaiTaiSan:newKeKhai.value.trim()}})
    result.value='Đã tạo nhân viên mới.'
    newUser.value='';newName.value='';newRole.value='officer'
    newPassword.value='';newConfirmPassword.value='';newManagerCode.value=''
    newGiayKhaiSinh.value='';newLyLichTuPhap.value='';newGiaySucKhoe.value='';newVanBang.value='';newQuyetDinhTuyenDung.value='';newPhuLucLyLich.value='';newQuyetDinhNhanSu.value='';newDanhGia.value='';newKeKhai.value=''
    await refresh();await refreshNuxtData('staff-list')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

function openDetail(s:Staff){selected.value=s;showDetail.value=true}
function closeManagerCode(){showManagerCode.value=false;inputManagerCode.value='';managerCodeError.value=''}
function verifyManagerCode(){
  if(!inputManagerCode.value.trim()){managerCodeError.value='Vui lòng nhập mã quản lý.';return}
  if(inputManagerCode.value.trim()===managerAccessCode.value){
    showManagerCode.value=false
    inputManagerCode.value=''
    managerCodeError.value=''
    managerAuthenticated.value=true
  }else{
    managerCodeError.value='Mã quản lý không đúng. Vui lòng thử lại.'
    inputManagerCode.value=''
  }
}
function closeDetail(){showDetail.value=false;selected.value=null}

function openEdit(s:Staff){
  selected.value=s
  editUser.value=s.username;editName.value=s.display_name;editRole.value=s.role;editActive.value=s.is_active
  editPassword.value=s.password||'';editConfirmPassword.value=s.password||'';editManagerCode.value=s.managerCode||''
  editGiayKhaiSinh.value=s.giayKhaiSinh||'';editLyLichTuPhap.value=s.lyLichTuPhap||''
  editGiaySucKhoe.value=s.giaySucKhoe||'';editVanBang.value=s.vanBangChungChi||'';editQuyetDinhTuyenDung.value=s.quyetDinhTuyenDung||''
  editPhuLucLyLich.value=s.phuLucLyLich||'';editQuyetDinhNhanSu.value=s.quyetDinhNhanSu||'';editDanhGia.value=s.danhGiaKiemDiem||'';editKeKhai.value=s.keKhaiTaiSan||''
  showDetail.value=false;showEdit.value=true
}
function closeEdit(){showEdit.value=false;selected.value=null;editPassword.value='';editConfirmPassword.value='';editManagerCode.value=''}

async function saveEdit(){
  if(!selected.value) return
  result.value='';busy.value=true
  try{
    if(!editPassword.value.trim()){result.value='Vui lòng nhập mật khẩu.';busy.value=false;return}
    if(editPassword.value.trim()!==editConfirmPassword.value.trim()){result.value='Mật khẩu xác nhận không khớp.';busy.value=false;return}
    if(editRole.value==='manager'&&!editManagerCode.value.trim()){result.value='Vai trò Quản lý phải nhập mã quản lý.';busy.value=false;return}
    await $fetch(`/api/staff/${selected.value.id}`,{method:'PATCH',body:{username:editUser.value.trim(),display_name:editName.value.trim(),role:editRole.value,is_active:editActive.value,password:editPassword.value.trim(),managerCode:editRole.value==='manager'?editManagerCode.value.trim():undefined,giayKhaiSinh:editGiayKhaiSinh.value.trim(),lyLichTuPhap:editLyLichTuPhap.value.trim(),giaySucKhoe:editGiaySucKhoe.value.trim(),vanBangChungChi:editVanBang.value.trim(),quyetDinhTuyenDung:editQuyetDinhTuyenDung.value.trim(),phuLucLyLich:editPhuLucLyLich.value.trim(),quyetDinhNhanSu:editQuyetDinhNhanSu.value.trim(),danhGiaKiemDiem:editDanhGia.value.trim(),keKhaiTaiSan:editKeKhai.value.trim()}})
    result.value='Đã cập nhật hồ sơ nhân viên.'
    closeEdit()
    await refreshNuxtData('staff-list')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

function openDelete(s:Staff){selected.value=s;showDetail.value=false;showDelete.value=true}
function closeDelete(){showDelete.value=false;selected.value=null}

async function removeStaff(){
  if(!selected.value) return
  result.value='';busy.value=true
  try{
    await $fetch(`/api/staff/${selected.value.id}`,{method:'DELETE'})
    result.value='Đã xóa nhân viên.'
    closeDelete()
    await refreshNuxtData('staff-list')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

async function approveRequest(req:ProfileChangeRequest){
  if(req.status!=='pending') return
  result.value='';busy.value=true
  try{
    await $fetch(`/api/profile-change-requests/${req.id}/approve`,{method:'PATCH',body:{status:'approved',note:''}})
    result.value='Đã phê duyệt yêu cầu thay đổi.'
    await refreshNuxtData('staff-list')
    await refreshNuxtData('profileChangeRequests')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

async function rejectRequest(req:ProfileChangeRequest){
  if(req.status!=='pending') return
  result.value='';busy.value=true
  try{
    await $fetch(`/api/profile-change-requests/${req.id}/reject`,{method:'PATCH',body:{status:'rejected',note:''}})
    result.value='Đã từ chối yêu cầu thay đổi.'
    await refreshNuxtData('profileChangeRequests')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

function roleLabel(r:string){return r==='admin'?'Quản trị viên':r==='manager'?'Quản lý':'Cán bộ xử lý'}
function fieldVal(v?:string){return v||'Chưa có'}
</script>
<template>
<div class="space-y-4" v-if="managerAuthenticated">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 class="text-xl font-black">Quản lý nhân viên</h2>
      <p class="text-sm text-muted">Danh sách và tạo tài khoản cán bộ quản trị hệ thống.</p>
    </div>
  </div>

  <div v-if="error" class="panel p-5 text-rose-700">Không tải được danh sách nhân viên. Kiểm tra PostgreSQL và phiên đăng nhập.</div>

  <div class="grid gap-3 md:grid-cols-2">
    <section class="panel space-y-4 p-5">
      <h3 class="section-label"><Users :size="20" class="text-brand-600"/>Danh sách nhân viên</h3>
      <div v-if="!staff?.length" class="p-4 text-sm text-muted">Chưa có nhân viên.</div>
      <div v-for="s in staff" :key="s.id" class="cursor-pointer rounded-lg border border-[#dae7f7] bg-white p-3 hover:bg-brand-50 transition" @click="openDetail(s)">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-ink">{{s.display_name}}</p>
            <p class="text-xs text-muted">{{s.username}} · {{roleLabel(s.role)}}</p>
          </div>
          <div class="flex items-center gap-2 ml-auto">
            <span :class="['rounded-full px-2.5 py-0.5 text-[10px] font-bold',s.is_active?'bg-green-100 text-green-700':'bg-rose-100 text-rose-700']">{{s.is_active?'Hoạt động':'Khóa'}}</span>
            <button @click.stop="openEdit(s)" class="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" title="Chỉnh sửa"><Edit3 :size="16"/></button>
            <button @click.stop="openDelete(s)" class="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" title="Xóa"><Trash2 :size="16"/></button>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>Mã: {{s.id}}</span>
          <span class="flex items-center gap-1"><ChevronRight :size="12"/>Xem hồ sơ</span>
        </div>
      </div>
    </section>

    <section class="panel space-y-4 p-5">
      <h3 class="section-label"><Plus :size="20" class="text-brand-600"/>Tạo tài khoản mới</h3>
      <form class="space-y-3" @submit.prevent="createStaff">
        <div><label class="field-label">Tên đăng nhập</label><input v-model="newUser" class="field" required minlength="3" maxlength="50" placeholder="Ví dụ: canbo.demo"/></div>
        <div><label class="field-label">Mật khẩu</label><input v-model="newPassword" class="field" type="password" required placeholder="Nhập mật khẩu tài khoản"/></div>
        <div><label class="field-label">Xác nhận mật khẩu</label><input v-model="newConfirmPassword" class="field" type="password" required placeholder="Nhập lại mật khẩu"/></div>
        <div><label class="field-label">Họ và tên</label><input v-model="newName" class="field" required minlength="2" maxlength="100"/></div>
        <div><label class="field-label">Vai trò</label><select v-model="newRole" class="field"><option value="officer">Cán bộ xử lý</option><option value="manager">Quản lý</option><option value="admin">Quản trị viên</option></select></div>
        <div v-if="newRole==='manager'"><label class="field-label">Mã quản lý</label><input v-model="newManagerCode" class="field" placeholder="Mã quản lý"/></div>

        <details class="border border-[#dae7f7] rounded-lg p-3 bg-[#f8fafc]" open>
          <summary class="cursor-pointer font-semibold text-brand-700 flex items-center gap-2"><FileText :size="16"/>Thông tin hồ sơ nhân viên</summary>
          <div class="mt-3 space-y-3">
            <div><label class="field-label">Giấy khai sinh (bản sao có chứng thực)</label><input v-model="newGiayKhaiSinh" class="field" placeholder="Số giấy khai sinh"/></div>
            <div><label class="field-label">Phiếu lý lịch tư pháp</label><input v-model="newLyLichTuPhap" class="field" placeholder="Số phiếu / ngày cấp"/></div>
            <div><label class="field-label">Giấy chứng nhận sức khỏe</label><input v-model="newGiaySucKhoe" class="field" placeholder="Cơ sở cấp / ngày hết hạn"/></div>
            <div><label class="field-label">Văn bằng, chứng chỉ</label><input v-model="newVanBang" class="field" placeholder="Tên bằng, cấp bậc, trường"/></div>
            <div><label class="field-label">Quyết định tuyển dụng / tiếp nhận</label><input v-model="newQuyetDinhTuyenDung" class="field" placeholder="Số quyết định / ngày ban hành"/></div>
            <div><label class="field-label">Phiếu bổ sung lý lịch định kỳ</label><input v-model="newPhuLucLyLich" class="field" placeholder="Lần bổ sung gần nhất"/></div>
            <div><label class="field-label">Quyết định nhân sự</label><input v-model="newQuyetDinhNhanSu" class="field" placeholder="Bổ nhiệm, điều động, nâng ngạch…"/></div>
            <div><label class="field-label">Đánh giá / kiểm điểm</label><input v-model="newDanhGia" class="field" placeholder="Kết quả đánh giá định kỳ"/></div>
            <div><label class="field-label">Kê khai tài sản, thu nhập</label><input v-model="newKeKhai" class="field" placeholder="Lần khai gần nhất"/></div>
          </div>
        </details>

        <p v-if="result" class="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">{{result}}</p>
        <button class="btn-primary" :disabled="busy" type="submit"><Edit3 :size="16"/> Tạo tài khoản</button>
      </form>
    </section>

    <section class="panel space-y-4 p-5 md:col-span-full">
      <h3 class="section-label"><Clock :size="20" class="text-brand-600"/>Yêu cầu thay đổi hồ sơ chờ duyệt</h3>
      <div v-if="!profileChangeRequests.filter(x=>x.status==='pending').length" class="p-4 text-sm text-muted">Không có yêu cầu thay đổi nào chờ duyệt.</div>
      <div v-for="r in profileChangeRequests.filter(x=>x.status==='pending')" :key="r.id" class="rounded-lg border border-[#dae7f7] bg-white p-3">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-bold text-ink">{{r.field}}</p>
          <span class="text-xs font-bold text-blue-700">Chờ duyệt</span>
        </div>
        <div class="text-xs text-muted mb-2">{{r.oldValue}} → {{r.newValue}}</div>
        <div class="flex items-center justify-end gap-2">
          <button @click="approveRequest(r)" class="btn-primary text-xs">Phê duyệt</button>
          <button @click="rejectRequest(r)" class="text-xs font-semibold text-rose-600 hover:underline">Từ chối</button>
        </div>
      </div>
    </section>
  </div>
</div>

<!-- Modal: Nhập mã quản lý -->
<teleport to="body">
<div v-if="showManagerCode" class="fixed inset-0 z-[60] flex items-center justify-center">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeManagerCode"></div>
  <div class="relative w-full max-w-md mx-4 p-3 bg-white rounded-2xl border border-[#dbe6f4] shadow-2xl animate-in fade-in zoom-in duration-200">
    <div class="flex items-center justify-between pb-3 border-b border-[#e3edf6]">
      <h3 class="text-lg font-extrabold text-ink flex items-center gap-2"><Key :size="20" class="text-brand-600"/>Xác thực mã quản lý</h3>
      <button @click="closeManagerCode" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X :size="18"/></button>
    </div>
    <div class="p-4 space-y-3">
      <p class="text-sm text-ink">Vui lòng nhập mã quản lý để truy cập trang quản lý nhân viên.</p>
      <div class="space-y-2">
        <label class="field-label">Mã quản lý</label>
        <input v-model="inputManagerCode" class="field" placeholder="Ví dụ: MQL-ADMIN-001" @keyup.enter="verifyManagerCode"/>
        <p v-if="managerCodeError" class="text-[11px] text-rose-600">{{managerCodeError}}</p>
      </div>
    </div>
    <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#e3edf6]">
      <button @click="closeManagerCode" class="btn-outline">Hủy</button>
      <button class="btn-primary" @click="verifyManagerCode">Xác nhận</button>
    </div>
  </div>
</div>
</teleport>

<!-- Modal: Chi tiết hồ sơ nhân viên -->
<teleport to="body">
<div v-if="showDetail && selected" class="fixed inset-0 z-[60] flex items-center justify-center">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDetail"></div>
  <div class="relative w-full max-w-2xl mx-4 p-3 bg-white rounded-2xl border border-[#dbe6f4] shadow-2xl animate-in fade-in zoom-in duration-200">
    <div class="flex items-center justify-between pb-3 border-b border-[#e3edf6]">
      <h3 class="text-lg font-extrabold text-ink flex items-center gap-2"><Eye :size="20" class="text-brand-600"/>Hồ sơ nhân viên</h3>
      <button @click="closeDetail" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X :size="18"/></button>
    </div>
    <div class="p-4 space-y-4">
      <div class="flex items-center gap-4">
        <div class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><User :size="30"/></div>
        <div class="min-w-0">
          <p class="text-base font-bold text-ink">{{selected.display_name}}</p>
          <p class="text-xs text-muted">{{selected.username}}</p>
        </div>
      </div>
      <div class="grid gap-2 text-sm">
        <div class="flex items-center gap-2"><Mail :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Email</span><span class="ml-auto text-muted">{{profileOf(selected).email}}</span></div>
        <div class="flex items-center gap-2"><Phone :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Số điện thoại</span><span class="ml-auto text-muted">{{profileOf(selected).phone}}</span></div>
        <div class="flex items-center gap-2"><Building :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Đơn vị</span><span class="ml-auto text-muted">{{selected.tenant_id}}</span></div>
        <div class="flex items-center gap-2"><MapPin :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Địa chỉ</span><span class="ml-auto text-muted">{{profileOf(selected).address}}</span></div>
        <div class="flex items-center gap-2"><Clock :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Ngày tạo</span><span class="ml-auto text-muted">{{new Date(selected.created_at).toLocaleDateString('vi-VN')}}</span></div>
        <div class="flex items-center gap-2"><ShieldCheck :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Vai trò</span><span class="ml-auto" :class="selected.role==='admin'?'text-brand-700':'text-ink'">{{roleLabel(selected.role)}}</span></div>
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full" :class="selected.is_active?'bg-green-500':'bg-rose-500'"/><span class="font-semibold text-ink">Trạng thái</span><span class="ml-auto" :class="selected.is_active?'text-green-700':'text-rose-700'">{{selected.is_active?'Hoạt động':'Khóa'}}</span></div>
      </div>

      <details class="border border-[#dae7f7] rounded-lg p-3 bg-[#f8fafc]">
        <summary class="cursor-pointer font-semibold text-brand-700 flex items-center gap-2"><FileText :size="16"/>Chi tiết hồ sơ cá nhân</summary>
        <div class="mt-3 grid gap-3 text-sm">
          <div class="flex items-start gap-2"><IdCard :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Giấy khai sinh</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.giayKhaiSinh)}}</span></div>
          <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Phiếu lý lịch tư pháp</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.lyLichTuPhap)}}</span></div>
          <div class="flex items-start gap-2"><FileCheck :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Giấy chứng nhận sức khỏe</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.giaySucKhoe)}}</span></div>
          <div class="flex items-start gap-2"><GraduationCap :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Văn bằng, chứng chỉ</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.vanBangChungChi)}}</span></div>
          <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Quyết định tuyển dụng / tiếp nhận</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.quyetDinhTuyenDung)}}</span></div>
          <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Phiếu bổ sung lý lịch định kỳ</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.phuLucLyLich)}}</span></div>
          <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Quyết định nhân sự</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.quyetDinhNhanSu)}}</span></div>
          <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Đánh giá / kiểm điểm</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.danhGiaKiemDiem)}}</span></div>
          <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Kê khai tài sản, thu nhập</span><span class="ml-auto text-muted max-w-xs break-words">{{fieldVal(selected.keKhaiTaiSan)}}</span></div>
        </div>
      </details>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#e3edf6]">
        <button @click="openEdit(selected)" class="btn-outline"><Edit3 :size="16" class="mr-1"/>Chỉnh sửa</button>
        <button @click="openDelete(selected)" class="text-sm font-semibold text-rose-600 hover:underline">Xóa nhân viên</button>
      </div>
    </div>
  </div>
</div>
</teleport>

<!-- Modal: Chỉnh sửa -->
<teleport to="body">
<div v-if="showEdit && selected" class="fixed inset-0 z-[60] flex items-center justify-center">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeEdit"></div>
  <div class="relative w-[600px] h-[600px] mx-4 p-4 bg-white rounded-2xl border border-[#dbe6f4] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto">
    <div class="flex items-center justify-between pb-3 border-b border-[#e3edf6] mb-4">
      <h3 class="text-lg font-extrabold text-ink flex items-center gap-2"><Edit3 :size="20" class="text-brand-600"/>Chỉnh sửa nhân viên</h3>
      <button @click="closeEdit" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X :size="18"/></button>
    </div>
    <form class="space-y-3" @submit.prevent="saveEdit">
      <div><label class="field-label">Tên đăng nhập</label><input v-model="editUser" class="field" required minlength="3" maxlength="50"/></div>
      <div><label class="field-label">Mật khẩu</label><input v-model="editPassword" class="field" type="password" placeholder="Nhập mật khẩu tài khoản"/></div>
      <div><label class="field-label">Xác nhận mật khẩu</label><input v-model="editConfirmPassword" class="field" type="password" placeholder="Nhập lại mật khẩu"/></div>
      <div><label class="field-label">Họ và tên</label><input v-model="editName" class="field" required minlength="2" maxlength="100"/></div>
      <div><label class="field-label">Vai trò</label><select v-model="editRole" class="field"><option value="officer">Cán bộ xử lý</option><option value="manager">Quản lý</option><option value="admin">Quản trị viên</option></select></div>
      <div v-if="editRole==='manager'"><label class="field-label">Mã quản lý</label><input v-model="editManagerCode" class="field" placeholder="Mã quản lý"/></div>
      <div class="flex items-center gap-2"><input id="edit-active" v-model="editActive" class="rounded-md text-brand-600 focus:ring-brand-500" type="checkbox"/><label for="edit-active" class="text-sm text-slate-700">Hoạt động</label></div>

      <details class="border border-[#dae7f7] rounded-lg p-3 bg-[#f8fafc]" open>
        <summary class="cursor-pointer font-semibold text-brand-700 flex items-center gap-2"><FileText :size="16"/>Thông tin hồ sơ nhân viên</summary>
        <div class="mt-3 space-y-3">
          <div><label class="field-label">Giấy khai sinh</label><input v-model="editGiayKhaiSinh" class="field"/></div>
          <div><label class="field-label">Phiếu lý lịch tư pháp</label><input v-model="editLyLichTuPhap" class="field"/></div>
          <div><label class="field-label">Giấy chứng nhận sức khỏe</label><input v-model="editGiaySucKhoe" class="field"/></div>
          <div><label class="field-label">Văn bằng, chứng chỉ</label><input v-model="editVanBang" class="field"/></div>
          <div><label class="field-label">Quyết định tuyển dụng / tiếp nhận</label><input v-model="editQuyetDinhTuyenDung" class="field"/></div>
          <div><label class="field-label">Phiếu bổ sung lý lịch định kỳ</label><input v-model="editPhuLucLyLich" class="field"/></div>
          <div><label class="field-label">Quyết định nhân sự</label><input v-model="editQuyetDinhNhanSu" class="field"/></div>
          <div><label class="field-label">Đánh giá / kiểm điểm</label><input v-model="editDanhGia" class="field"/></div>
          <div><label class="field-label">Kê khai tài sản, thu nhập</label><input v-model="editKeKhai" class="field"/></div>
        </div>
      </details>

      <p v-if="result" class="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">{{result}}</p>
      <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#e3edf6]">
        <button @click="closeEdit" class="btn-outline">Hủy</button>
        <button class="btn-primary" :disabled="busy" type="submit">Lưu thay đổi</button>
      </div>
    </form>
  </div>
</div>
</teleport>

<!-- Modal: Xác nhận xóa -->
<teleport to="body">
<div v-if="showDelete && selected" class="fixed inset-0 z-[60] flex items-center justify-center">
  <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDelete"></div>
  <div class="relative w-full max-w-md mx-4 p-3 bg-white rounded-2xl border border-[#dbe6f4] shadow-2xl animate-in fade-in zoom-in duration-200">
    <div class="flex items-center justify-between pb-3 border-b border-[#e3edf6]">
      <h3 class="text-lg font-extrabold text-ink flex items-center gap-2"><Trash2 :size="20" class="text-rose-600"/>Xóa nhân viên</h3>
      <button @click="closeDelete" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X :size="18"/></button>
    </div>
    <div class="p-4 space-y-3">
      <p class="text-sm text-ink">Bạn chắc chắn muốn xóa tài khoản <strong>{{selected.display_name}}</strong> (<span class="font-mono text-xs">{{selected.username}}</span>)?</p>
      <p class="text-xs text-muted">Hành động này không thể hoàn tác (trong bản dựng mô phỏng).</p>
    </div>
    <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#e3edf6]">
      <button @click="closeDelete" class="btn-outline">Hủy</button>
      <button class="btn-primary" :disabled="busy" @click="removeStaff">Xóa</button>
    </div>
  </div>
</div>
</teleport>
</template>
