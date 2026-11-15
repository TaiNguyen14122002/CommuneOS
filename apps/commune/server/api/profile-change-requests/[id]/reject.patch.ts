// SPDX-FileCopyrightText: 2026 CommuneOS Contributors
// SPDX-License-Identifier: Apache-2.0
import { profileChangeReviewSchema,validate } from '../../../utils/validation'
import { staffTx } from '../../../utils/database'
export default defineEventHandler(async(event)=>staffTx(event,async(client,actor)=>{
  const id=getRouterParam(event,'id')
  if(!id)throw createError({statusCode:400,statusMessage:'Thiếu mã yêu cầu'})
  const body=validate(profileChangeReviewSchema,await readBody(event))
  const req=(await client.query('SELECT * FROM profile_change_requests WHERE id=$1 AND status=$2',[id,'pending'])).rows[0]
  if(!req)throw createError({statusCode:404,statusMessage:'Yêu cầu không tồn tại hoặc đã được xử lý'})
  await client.query(`UPDATE profile_change_requests SET status='rejected',reviewed_at=now(),reviewed_by=$2,note=$3 WHERE id=$1`,[id,actor.id,body.note||null])
  return {id,status:'rejected',reviewedAt:new Date().toISOString(),reviewedBy:actor.id}
}))
