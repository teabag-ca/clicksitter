const CHECKR_API_URL = 'https://api.checkr.com/v1'

export async function createCandidate(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  dob: string // YYYY-MM-DD format
) {
  const response = await fetch(`${CHECKR_API_URL}/candidates`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.CHECKR_API_KEY! + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,
    }),
  })

  if (!response.ok) {
    throw new Error(`Checkr API error: ${response.statusText}`)
  }

  return response.json()
}

export async function createReport(candidateId: string, packageType: string = 'driver_pro') {
  const response = await fetch(`${CHECKR_API_URL}/reports`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.CHECKR_API_KEY! + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      package: packageType,
    }),
  })

  if (!response.ok) {
    throw new Error(`Checkr API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getReport(reportId: string) {
  const response = await fetch(`${CHECKR_API_URL}/reports/${reportId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.CHECKR_API_KEY! + ':').toString('base64')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Checkr API error: ${response.statusText}`)
  }

  return response.json()
}

