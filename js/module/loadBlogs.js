import { fetchJSON } from './fetchJSON.js';

export  async function loadBlogs(selector,limit=3){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('blogs');
  let items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Blogs available.</p>';
        }

        if(limit){
            items=items.slice(0,limit);
        }

        container.innerHTML=items.map(n=>
            `
                <div class="blog-card">
                  <div class="sub-blog-card">
                    <img
                      src="./img/blog.png"
                      alt="Neural Chip Research"
                      class="blog-img"
                    />
                    <div class="blog-content-header">
                      <h3 class="blog-title">${n.title}</h3>
                      <ul class="blog-meta">
                        <li>
                          <img
                            src="./img/blogs/writer.svg"
                            class="blogs-icons"
                          /><span>${n.author}</span>
                        </li>
                        <li>
                          <img
                            src="./img/blogs/calender.svg"
                            class="blogs-icons"/>
                            <span>${new Date(n.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                            </span>
                        </li>
                        <li>
                          <img
                            src="./img/blogs/clock.svg"
                            class="blogs-icons"
                          /><span> ${n.readTime} read</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <p class="blog-desc">${n.description}</p>
                    <div class="blog-read-more-btn">
                      <a href="${n.link}" class="btn-read-more">Read More</a>
                      <img src="./img/blogs/go.svg" class="read-more-icon" />
                    </div>
                  </div>
                </div>
            `
        ).join('');

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load Blogs.</p>';
    }
}