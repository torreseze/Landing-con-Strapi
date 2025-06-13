const fs = require('fs');

async function testStrapiImages() {
  try {
    // Leer variables del .env.local
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
    const urlMatch = envContent.match(/NEXT_PUBLIC_STRAPI_URL=(.+)/);
    
    const token = tokenMatch?.[1]?.trim();
    const strapiUrl = urlMatch?.[1]?.trim() || 'http://localhost:1337';
    
    if (!token) {
      console.log('No se encontró el token');
      return;
    }

    console.log('🌐 Usando Strapi URL:', strapiUrl);

    const url = `${strapiUrl}/api/landing-pages?filters[slug][$eq]=landing-page&populate[dynamicZone][on][layout.navbar][populate]=*&populate[dynamicZone][on][sections.hero][populate]=*&populate[dynamicZone][on][sections.content][populate]=*`;

    console.log('🔍 Haciendo request a:', url);

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      console.log(`❌ Error HTTP: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const components = data.data[0]?.dynamicZone || [];
    
    console.log('\n=== TODOS LOS COMPONENTES ===');
    console.log(`📊 Total de componentes: ${components.length}`);
    
    components.forEach((component, index) => {
      console.log(`\n--- Componente ${index + 1} ---`);
      console.log(`Tipo: ${component.__component}`);
      console.log(`ID: ${component.id}`);
      
      if (component.title) {
        console.log(`Título: ${component.title}`);
      }
      
      if (component.subtitle) {
        console.log(`Subtítulo: ${component.subtitle}`);
      }
    });
    
    console.log('\n=== NAVBAR COMPONENTS ===');
    const navbars = components.filter(c => c.__component === 'layout.navbar');
    console.log(`🧭 Navbars encontrados: ${navbars.length}`);
    navbars.forEach(navbar => {
      console.log('Logo data:', JSON.stringify(navbar.logo, null, 2));
    });
    
    console.log('\n=== HERO COMPONENTS ===');
    const heroes = components.filter(c => c.__component === 'sections.hero');
    console.log(`🦸 Heroes encontrados: ${heroes.length}`);
    heroes.forEach(hero => {
      console.log(`Título: ${hero.title}`);
    });
    
    console.log('\n=== CONTENT COMPONENTS ===');
    const contents = components.filter(c => c.__component === 'sections.content');
    console.log(`📄 Contents encontrados: ${contents.length}`);
    contents.forEach((content, index) => {
      console.log(`\n--- Content ${index + 1} ---`);
      console.log(`Título: ${content.title}`);
      console.log(`Subtítulo: ${content.subtitle || 'Sin subtítulo'}`);
      console.log(`Tiene imagen: ${content.image ? 'Sí' : 'No'}`);
      if (content.image) {
        console.log('Image data:', JSON.stringify(content.image, null, 2));
      }
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testStrapiImages(); 