// SPDX-FileCopyrightText: 2026 CommuneOS Contributors
// SPDX-License-Identifier: Apache-2.0
import { staffTx } from '../../utils/database'
export default defineEventHandler(async(event)=>staffTx(event,async(client,actor)=>{
  const id=getRouterParam(event,'id')
  if(!id)throw createError({statusCode:400,statusMessage:'Thiếu mã nhân viên'})
  const existing=(await client.query('SELECT id FROM staff WHERE id=$1',[id])).rows[0]
  if(!existing)throw createError({statusCode:404,statusMessage:'Không tìm thấy nhân viên'})
  await client.query('DELETE FROM staff WHERE id=$1',[id])
  return {id,deleted:true}
}))
