<!-- SPDX-FileCopyrightText: 2026 CommuneOS Contributors -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<script setup lang="ts">
import { User, Mail, Phone, Building, MapPin, Clock, ShieldCheck, FileText, IdCard, FileCheck, GraduationCap, Upload, Send } from 'lucide-vue-next'
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
const myProfile=ref<Staff|null>(null)
const originalProfile=ref<Staff|null>(null)
const profileChangeRequests=useState<ProfileChangeRequest[]>('profileChangeRequests', () => [])

const demoProfiles:Record<string,StaffProfile>={}

function profileOf(s:Staff):StaffProfile{
  if(demoProfiles[s.id]) return demoProfiles[s.id]
  const p:StaffProfile={...s,phone:'0900 000 000',email:`${s.username}@commune.local`,address:'Phòng quản trị, UBND xã'}
  demoProfiles[s.id]=p
  return p
}

function roleLabel(r:string){return r==='admin'?'Quản trị viên':r==='manager'?'Quản lý':'Cán bộ xử lý'}
function fieldVal(v?:string){return v||'Chưa có'}

function getChangedFields():{field:string;oldValue:string;newValue:string}[]{
  if(!myProfile.value||!originalProfile.value) return []
  const fields:Record<string,{label:string;old:string;new:string}>={
    display_name:{label:'Họ và tên',old:originalProfile.value.display_name,new:myProfile.value.display_name},
    username:{label:'Tên đăng nhập',old:originalProfile.value.username,new:myProfile.value.username},
    tenant_id:{label:'Đơn vị',old:originalProfile.value.tenant_id,new:myProfile.value.tenant_id},
    email:{label:'Email',old:originalProfile.value.email||'',new:myProfile.value.email||''},
    phone:{label:'Số điện thoại',old:originalProfile.value.phone||'',new:myProfile.value.phone||''},
    address:{label:'Địa chỉ',old:originalProfile.value.address||'',new:myProfile.value.address||''},
    giayKhaiSinh:{label:'Giấy khai sinh',old:originalProfile.value.giayKhaiSinh||'',new:myProfile.value.giayKhaiSinh||''},
    lyLichTuPhap:{label:'Phiếu lý lịch tư pháp',old:originalProfile.value.lyLichTuPhap||'',new:myProfile.value.lyLichTuPhap||''},
    giaySucKhoe:{label:'Giấy chứng nhận sức khỏe',old:originalProfile.value.giaySucKhoe||'',new:myProfile.value.giaySucKhoe||''},
    vanBangChungChi:{label:'Văn bằng, chứng chỉ',old:originalProfile.value.vanBangChungChi||'',new:myProfile.value.vanBangChungChi||''},
    quyetDinhTuyenDung:{label:'Quyết định tuyển dụng / tiếp nhận',old:originalProfile.value.quyetDinhTuyenDung||'',new:myProfile.value.quyetDinhTuyenDung||''},
    phuLucLyLich:{label:'Phiếu bổ sung lý lịch định kỳ',old:originalProfile.value.phuLucLyLich||'',new:myProfile.value.phuLucLyLich||''},
    quyetDinhNhanSu:{label:'Quyết định nhân sự',old:originalProfile.value.quyetDinhNhanSu||'',new:myProfile.value.quyetDinhNhanSu||''},
    danhGiaKiemDiem:{label:'Đánh giá / kiểm điểm',old:originalProfile.value.danhGiaKiemDiem||'',new:myProfile.value.danhGiaKiemDiem||''},
    keKhaiTaiSan:{label:'Kê khai tài sản, thu nhập',old:originalProfile.value.keKhaiTaiSan||'',new:myProfile.value.keKhaiTaiSan||''},
  }
  const changes:{field:string;oldValue:string;newValue:string}[]=[]
  for(const [key,val] of Object.entries(fields)){
    if(val.old!==val.new){
      changes.push({field:key,oldValue:val.old,newValue:val.new})
    }
  }
  return changes
}

async function submitChangeRequest(){
  if(!myProfile.value) return
  const changes=getChangedFields()
  if(changes.length===0){result.value='Không có thay đổi nào để gửi.';return}
  busy.value=true
  try{
    for(const ch of changes){
      await $fetch('/api/profile-change-requests',{method:'POST',body:{field:ch.field,oldValue:ch.oldValue,newValue:ch.newValue}})
    }
    result.value='Đã gửi '+changes.length+' yêu cầu thay đổi cho người quản lý phê duyệt.'
    await refreshNuxtData('profileChangeRequests')
  }catch(e){result.value=readableError(e)}finally{busy.value=false}
}

if(!staff.value?.length){
  myProfile.value=null
  originalProfile.value=null
}else{
  myProfile.value={...staff.value[0]}
  originalProfile.value={...staff.value[0]}
}
</script>
<template>
<div class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 class="text-xl font-black">Hồ sơ cá nhân của tôi</h2>
      <p class="text-sm text-muted">Xem và gửi yêu cầu cập nhật thông tin hồ sơ cá nhân. Yêu cầu sẽ được người quản lý phê duyệt trước khi có hiệu lực.</p>
    </div>
  </div>

  <div v-if="error" class="panel p-5 text-rose-700">Không tải được hồ sơ cá nhân. Kiểm tra PostgreSQL và phiên đăng nhập.</div>

  <div v-if="!myProfile" class="panel p-5 text-sm text-muted">Chưa có hồ sơ cá nhân.</div>

  <div v-if="myProfile" class="grid gap-3 md:grid-cols-2">
    <section class="panel space-y-4 p-5">
      <h3 class="section-label"><User :size="20" class="text-brand-600"/>Thông tin cơ bản</h3>
      <div class="flex items-center gap-4 mb-4">
        <div class="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><User :size="40"/></div>
        <div class="min-w-0">
          <p class="text-base font-bold text-ink">{{myProfile.display_name}}</p>
          <p class="text-xs text-muted">{{myProfile.username}}</p>
        </div>
      </div>
      <div class="grid gap-2 text-sm">
        <div class="flex items-center gap-2"><ShieldCheck :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Vai trò</span><span class="ml-auto" :class="myProfile.role==='admin'?'text-brand-700':'text-ink'">{{roleLabel(myProfile.role)}}</span></div>
        <div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full" :class="myProfile.is_active?'bg-green-500':'bg-rose-500'"/><span class="font-semibold text-ink">Trạng thái</span><span class="ml-auto" :class="myProfile.is_active?'text-green-700':'text-rose-700'">{{myProfile.is_active?'Hoạt động':'Khóa'}}</span></div>
        <div class="flex items-center gap-2"><Building :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Đơn vị</span><span class="ml-auto text-muted">{{myProfile.tenant_id}}</span></div>
        <div class="flex items-center gap-2"><Clock :size="16" class="text-slate-400"/><span class="font-semibold text-ink">Ngày tạo</span><span class="ml-auto text-muted">{{new Date(myProfile.created_at).toLocaleDateString('vi-VN')}}</span></div>
      </div>
      <div v-if="profileChangeRequests.length>0" class="mt-4 p-3 rounded-lg border border-[#dae7f7] bg-[#f8fafc]">
        <h4 class="text-xs font-bold text-brand-700 mb-2">Yêu cầu thay đổi của bạn</h4>
        <div class="space-y-2 text-xs">
          <div v-for="r in profileChangeRequests" :key="r.id" class="flex items-center justify-between gap-2 p-1.5 rounded border" :class="r.status==='pending'?'border-blue-200 bg-blue-50':r.status==='approved'?'border-green-200 bg-green-50':'border-rose-200 bg-rose-50'">
            <span class="font-semibold text-ink">{{r.field}}</span>
            <span :class="r.status==='pending'?'text-blue-700 font-bold':r.status==='approved'?'text-green-700 font-bold':'text-rose-700 font-bold'">{{r.status==='pending'?'Đang chờ duyệt':r.status==='approved'?'Đã phê duyệt':'Đã từ chối'}}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel space-y-4 p-5">
      <h3 class="section-label"><Send :size="20" class="text-brand-600"/>Gửi yêu cầu cập nhật</h3>
      <form class="space-y-3" @submit.prevent="submitChangeRequest">
        <div><label class="field-label">Họ và tên</label><input v-model="myProfile.display_name" class="field" required minlength="2" maxlength="100"/></div>
        <div><label class="field-label">Tên đăng nhập</label><input v-model="myProfile.username" class="field" required minlength="3" maxlength="50"/></div>
        <div><label class="field-label">Đơn vị</label><input v-model="myProfile.tenant_id" class="field" readonly/></div>
        <div><label class="field-label">Email</label><input v-model="myProfile.email" class="field" placeholder="email@example.com"/></div>
        <div><label class="field-label">Số điện thoại</label><input v-model="myProfile.phone" class="field" placeholder="Số điện thoại"/></div>
        <div><label class="field-label">Địa chỉ</label><input v-model="myProfile.address" class="field" placeholder="Địa chỉ liên lạc"/></div>

        <details class="border border-[#dae7f7] rounded-lg p-3 bg-[#f8fafc]" open>
          <summary class="cursor-pointer font-semibold text-brand-700 flex items-center gap-2"><FileText :size="16"/>Chi tiết hồ sơ cá nhân</summary>
          <div class="mt-3 grid gap-3 text-sm">
            <div class="flex items-start gap-2"><IdCard :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Giấy khai sinh</span><input v-model="myProfile.giayKhaiSinh" class="field ml-auto max-w-xs" placeholder="Số giấy khai sinh"/></div>
            <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Phiếu lý lịch tư pháp</span><input v-model="myProfile.lyLichTuPhap" class="field ml-auto max-w-xs" placeholder="Số phiếu / ngày cấp"/></div>
            <div class="flex items-start gap-2"><FileCheck :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Giấy chứng nhận sức khỏe</span><input v-model="myProfile.giaySucKhoe" class="field ml-auto max-w-xs" placeholder="Cơ sở cấp / ngày hết hạn"/></div>
            <div class="flex items-start gap-2"><GraduationCap :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Văn bằng, chứng chỉ</span><input v-model="myProfile.vanBangChungChi" class="field ml-auto max-w-xs" placeholder="Tên bằng, cấp bậc, trường"/></div>
            <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Quyết định tuyển dụng / tiếp nhận</span><input v-model="myProfile.quyetDinhTuyenDung" class="field ml-auto max-w-xs" placeholder="Số quyết định / ngày ban hành"/></div>
            <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Phiếu bổ sung lý lịch định kỳ</span><input v-model="myProfile.phuLucLyLich" class="field ml-auto max-w-xs" placeholder="Lần bổ sung gần nhất"/></div>
            <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Quyết định nhân sự</span><input v-model="myProfile.quyetDinhNhanSu" class="field ml-auto max-w-xs" placeholder="Bổ nhiệm, điều động, nâng ngạch…"/></div>
            <div class="flex items-start gap-2"><FileText :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Đánh giá / kiểm điểm</span><input v-model="myProfile.danhGiaKiemDiem" class="field ml-auto max-w-xs" placeholder="Kết quả đánh giá định kỳ"/></div>
            <div class="flex items-start gap-2"><Upload :size="14" class="text-slate-400 mt-0.5"/><span class="font-semibold text-ink">Kê khai tài sản, thu nhập</span><input v-model="myProfile.keKhaiTaiSan" class="field ml-auto max-w-xs" placeholder="Lần khai gần nhất"/></div>
          </div>
        </details>

        <p v-if="result" class="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">{{result}}</p>
        <button class="btn-primary" :disabled="busy" type="submit"><Send :size="16" class="mr-1"/>Gửi yêu cầu thay đổi</button>
      </form>
    </section>
  </div>
</div>
</template>
