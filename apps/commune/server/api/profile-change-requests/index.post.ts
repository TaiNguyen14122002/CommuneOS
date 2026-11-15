// SPDX-FileCopyrightText: 2026 CommuneOS Contributors
// SPDX-License-Identifier: Apache-2.0
import { profileChangeRequestSchema,validate } from '../../utils/validation'
import { staffTx } from '../../utils/database'
export default defineEventHandler(async(event)=>staffTx(event,async(client,actor)=>{
  const body=validate(profileChangeRequestSchema,await readBody(event))
  const id=`pcr-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await client.query(`INSERT INTO profile_change_requests(id,staff_id,field,old_value,new_value,status,requested_at) VALUES($1,$2,$3,$4,$5,'pending',now())`,
    [id,actor.id,body.field,body.oldValue||null,body.newValue||null])
  return {id,staffId:actor.id,field:body.field,oldValue:body.oldValue||null,newValue:body.newValue||null,status:'pending',requestedAt:new Date().toISOString()}
}))
