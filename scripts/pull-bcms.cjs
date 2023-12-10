const nodefs = require('fs/promises');
const path = require('path');
const { createFS } = require('@banez/fs');
const { createBcmsClient } = require('@becomes/cms-client');

/**
 *
 * @param {import('@becomes/cms-client/types').BCMSClientMediaResponseItem} media
 * @param {import('@becomes/cms-client/types').BCMSClientMediaResponseItem[]} allMedia
 * @returns {string}
 */
function resolveMediaPath(media, allMedia) {
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
    base: path.join(process.cwd()),
  });
  const client = createBcmsClient({
    cmsOrigin: 'https://cms.vajaga.com',
    key: {
      id: '656ae6614e686c756b6d015a',
      secret:
        '0496ece0d1c964e31ba2cb5aaf781af07700819e01e07297e210d59b3c78e73b',
    },
  });
  const tsTypes = await client.typeConverter.getAll({
    language: 'typescript',
  });
  /**
   * @type {string[]}
   */
  let index = [];
  for (let i = 0; i < tsTypes.length; i++) {
    const tsType = tsTypes[i];
    if (
      // true
      tsType.outputFile.includes('lm_')
    ) {
      await fs.save(
        ['src', 'types', 'bcms', ...tsType.outputFile.split('/')],
        tsType.content
      );
      index.push(`export * from './${tsType.outputFile}';`);
    }
  }
  await fs.save(['src', 'types', 'bcms', 'index.d.ts'], index.join('\n'));
  const rustTypes = await client.typeConverter.getAll({
    language: 'rust',
  });
  if (await fs.exist(['src-tauri', 'src', 'bcms'])) {
    await fs.deleteDir(['src-tauri', 'src', 'bcms']);
  }
  index = [];
  for (let i = 0; i < rustTypes.length; i++) {
    const rustType = rustTypes[i];
    if (
      rustType.outputFile.includes('lm_') ||
      rustType.outputFile === 'media.rs' ||
      rustType.outputFile === 'content.rs' ||
      rustType.outputFile.endsWith('mod.rs')
      // true
    ) {
      if (rustType.outputFile.endsWith('mod.rs')) {
        await fs.save(
          ['src-tauri', 'src', 'bcms', ...rustType.outputFile.split('/')],
          rustType.content
            .split('\n')
            .filter((line) => {
              return (
                line.includes('lm_') ||
                line === 'pub mod entry;' ||
                line === 'pub mod r#enum;' ||
                line === 'pub mod group;' ||
                line === 'pub mod template;' ||
                line === 'pub mod widget;' ||
                line === 'pub mod media;' ||
                line === 'pub mod content;'
              );
            })
            .join('\n')
        );
      } else {
        await fs.save(
          ['src-tauri', 'src', 'bcms', ...rustType.outputFile.split('/')],
          rustType.content
        );
      }
    }
  }
  // const l1 = await fs.readdir(['src-tauri', 'src', 'bcms']);
  // for (let i = 0; i < l1.length; i++) {
  //   const name = l1[i];
  //   index.push(`pub mod ${name.replace('.rs', '')};`);
  //   if (!name.endsWith('.rs')) {
  //     const l2 = await fs.readdir(['src-tauri', 'src', 'bcms', name]);
  //     /**
  //      * @type {string[]}
  //      */
  //     const l2Index = [];
  //     for (let j = 0; j < l2.length; j++) {
  //       const childName = l2[j].replace('.rs', '');
  //       l2Index.push(`pub mod ${childName};`);
  //     }
  //     await fs.save(
  //       ['src-tauri', 'src', 'bcms', name, 'mod.rs'],
  //       l2Index.join('\n')
  //     );
  //   }
  // }
  // await fs.save(['src-tauri', 'src', 'bcms', 'mod.rs'], index.join('\n'));
  const templates = await client.template.getAll();
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    console.log(`[${i + 1}/${templates.length}] Entries for ${template.label}`);
    const entries = await client.entry.getAll({
      template: template._id,
      pLang: 'rust',
    });
    await fs.save(
      ['public', 'bcms', 'content', template.name + '.json'],
      JSON.stringify(entries, null, 2).replace(
        /src": "\/last-minute/g,
        'src": "/bcms'
      )
    );
    await nodefs.appendFile(
      path.join(
        process.cwd(),
        'src-tauri',
        'src',
        'bcms',
        'entry',
        template.name + '.rs'
      ),
      [
        '',
        '',
        `pub const ${template.name.toUpperCase()}_META_ITEMS: &str = r#"\n${JSON.stringify(
          entries.map((e) => {
            return e.meta.en;
          }),
          null,
          4
        )}\n"#;`,
      ].join('\n')
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
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
