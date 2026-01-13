/*
Ex-
let allTeamMembers = [
    { eNumber: "E/19/008" },
    { eNumber: "E/19/129" },
    { eNumber: "E/19/275" }
];

output -
 
{
    image: "https://people.ce.pdn.ac.lk/images/students/e19/e19008.jpg",
    name: "Rathnayaka Adhikarige Janith Chandula Adhikari",
    position: "Student",
    eNumber: "E/19/008",
    urls: {
        cv: "...",
        website: "...",
        linkedin: "...",
        github: "...",
        facebook: "...",
        researchgate: "..."
    }
}



*/

export async function fetchTeamMembers(allTeamMembers) {

    function buildProfilePage(eNumber) {
        const m = String(eNumber).match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
        if (!m) return '';
        return `https://people.ce.pdn.ac.lk/students/e${m[2]}/${m[3]}/`;
    }


    return await Promise.all(
        allTeamMembers.map(async (member) => {
            try {
                const m = String(member.eNumber).match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
                if (!m) throw new Error('Invalid eNumber format');

                const batch = m[1] + m[2];
                const id = m[3];
                const url = `https://api.ce.pdn.ac.lk/people/v1/students/${batch}/${id}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`CE API ${response.status}`);

                const json = await response.json();

                return {
                    image: json.profile_image || '',
                    name: json.name_with_initials,
                    position: 'Student',
                    current_affiliation: member.current || json.current_affiliation || json.current_position || json.current_status || '',
                    eNumber: member.eNumber,
                    urls:json.urls || {},
                    profile_page: buildProfilePage(member.eNumber)
                };

            } catch (e) {
                console.warn('Failed CE lookup for', member.eNumber, e);

                return {
                    image: '',
                    name: member.name || member.eNumber,
                    position: 'Student',
                    current_affiliation: member.current || '',
                    eNumber: member.eNumber
                };
            }
        })
    );
}
