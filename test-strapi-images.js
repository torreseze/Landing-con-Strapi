const fs = require('fs');

async function testStrapiImages() {
  try {
    // Leer token del .env.local
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
    const token = tokenMatch?.[1]?.trim();
    
    if (!token) {
      console.log('No se encontró el token');
      return;
    }

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const url = `${strapiUrl}/api/landing-pages?filters[slug][$eq]=pagina-principal&populate[dynamicZone][on][layout.navbar][populate]=*&populate[dynamicZone][on][sections.hero][populate]=*&populate[dynamicZone][on][sections.content][populate]=*`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const components = data.data[0]?.dynamicZone || [];
    
    console.log('=== NAVBAR COMPONENTS ===');
    components.filter(c => c.__component === 'layout.navbar').forEach(navbar => {
      console.log('Logo data:', JSON.stringify(navbar.logo, null, 2));
    });
    
    console.log('\n=== CONTENT COMPONENTS ===');
    components.filter(c => c.__component === 'sections.content').forEach(content => {
      console.log('Image data:', JSON.stringify(content.image, null, 2));
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testStrapiImages(); 