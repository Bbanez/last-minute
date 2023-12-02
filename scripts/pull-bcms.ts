import { createFS } from '@banez/fs';
import { createBcmsClient } from '@becomes/cms-client';
import { BCMSClientMediaResponseItem } from '@becomes/cms-client/types';

function resolveMediaPath(
  media: BCMSClientMediaResponseItem,
  allMedia: BCMSClientMediaResponseItem[]
): string {
  if (!media.isInRoot) {
    const parent = allMedia.find((e) => e._id === media.parentId);
    if (parent) {
      return `${resolveMediaPath(parent, allMedia)}/${media.name}`;
    }
  }
  return `/${media.name}`;
}

async function main() {
  const fs = createFS({
    base: process.cwd(),
  });
  const client = createBcmsClient({
    cmsOrigin: 'https://cms.vajaga.com',
    key: {
      id: '656ae6614e686c756b6d015a',
      secret:
        '0496ece0d1c964e31ba2cb5aaf781af07700819e01e07297e210d59b3c78e73b',
    },
  });
  const templates = await client.template.getAll();
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    console.log(`[${i + 1}/${templates.length}] Entries for ${template.label}`);
    const entries = await client.entry.getAll({
      template: template._id,
    });
    await fs.save(
      ['public', 'bcms', 'content', template.name + '.json'],
      JSON.stringify(entries, null, 2).replace(
        /src": "\/last-minute/g,
        'src": "/bcms'
      )
    );
  }
  const media = await client.media.getAll();
  for (let i = 0; i < media.length; i++) {
    const item = media[i];
    const path = resolveMediaPath(item, media);
    if (item.type !== 'DIR' && path.startsWith('/last-minute')) {
      console.log(path);
      await fs.save(
        ['public', 'bcms', ...path.split('/').slice(2)],
        await item.bin()
      );
    }
  }
  const tsTypes = await client.typeConverter.getAll({
    language: 'typescript',
  });
  const index: string[] = [];
  for (let i = 0; i < tsTypes.length; i++) {
    const tsType = tsTypes[i];
    if (tsType.outputFile.includes('lm_')) {
      await fs.save(
        ['src', 'types', 'bcms', ...tsType.outputFile.split('/')],
        tsType.content
      );
      index.push(`export * from './${tsType.outputFile}';`);
    }
  }
  await fs.save(['src', 'types', 'bcms', 'index.d.ts'], index.join('\n'));
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
