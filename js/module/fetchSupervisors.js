export async function fetchSupervisors(allSupervisors = []) {
    return Promise.all(
        allSupervisors.map(async (supervisor) => {
            try {
                const tag = supervisor.email.split('@')[0]; // e.g. "asithab"
                const url = `https://api.ce.pdn.ac.lk/people/v1/staff/${tag}/`;

                const response = await fetch(url);
                if (!response.ok) throw new Error(`CE staff API ${response.status}`);

                const json = await response.json();

                return {
                    image: json.profile_image,
                    name: supervisor.name,
                    position: json.designation,
                    email: supervisor.email,
                    urls: json.urls || {},
                    profile_page:supervisor.profile_page
                    
                };
            } catch (e) {
                console.warn("Failed CE staff lookup for", supervisor.email, e);
                return {
                    image: "",
                    name: supervisor.name || supervisor.email,
                    position: "Lecturer",
                    email: supervisor.email,
                    urls: {},
                    profile_page: `https://people.ce.pdn.ac.lk/staff/${supervisor.email.split('@')[0]}/`
                };
            }
        })
    );
}
