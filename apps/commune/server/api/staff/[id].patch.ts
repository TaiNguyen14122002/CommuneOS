// SPDX-FileCopyrightText: 2026 CommuneOS Contributors
// SPDX-License-Identifier: Apache-2.0
import { staffSchema,validate } from '../../utils/validation'
import { staffTx } from '../../utils/database'
export default defineEventHandler(async(event)=>staffTx(event,async(client,actor)=>{
  const id=getRouterParam(event,'id')
  if(!id)throw createError({statusCode:400,statusMessage:'Thiếu mã nhân viên'})
  const body=validate(staffSchema,await readBody(event))
  const existing=(await client.query('SELECT id FROM staff WHERE id=$1',[id])).rows[0]
  if(!existing)throw createError({statusCode:404,statusMessage:'Không tìm thấy nhân viên'})
  await client.query(`UPDATE staff SET username=$2,display_name=$3,role=$4,is_active=$5,password=$6,manager_code=$7,phone=$8,email=$9,address=$10 WHERE id=$1`,
    [id,body.username,body.display_name,body.role,body.is_active!==undefined?body.is_active:true,body.password||null,body.role==='manager'?(body.managerCode||null):null,body.phone||null,body.email||null,body.address||null])
  const row=(await client.query('SELECT id,username,display_name,role,tenant_id,is_active,created_at,phone,email,address,password,manager_code FROM staff WHERE id=$1',[id])).rows[0]
  return row
}))
