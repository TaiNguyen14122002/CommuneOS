// SPDX-FileCopyrightText: 2026 CommuneOS Contributors
// SPDX-License-Identifier: Apache-2.0
import { staffTx } from '../../utils/database'
export default defineEventHandler(async(event)=>staffTx(event,async(client,actor)=>{
  const rows=(await client.query(`SELECT pcr.id,pcr.staff_id,pcr.field,pcr.old_value,pcr.new_value,pcr.status,pcr.requested_at,pcr.reviewed_at,pcr.reviewed_by,pcr.note,s.username,s.display_name FROM profile_change_requests pcr JOIN staff s ON s.id=pcr.staff_id ORDER BY pcr.requested_at DESC`)).rows
  return rows
}))
