/**
 * 检查 Task 8 的状态
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTask8() {
  try {
    console.log('\n🔍 Checking Task 8 status...\n');

    // 检查 Task
    const task = await prisma.task.findUnique({
      where: { taskId: '8' },
    });

    if (task) {
      console.log('✅ Task 8 exists:');
      console.log(`   Title: ${task.title}`);
      console.log(`   Description: ${task.description.substring(0, 50)}...`);
      console.log(`   Contacts (plaintext): ${task.contactsPlaintext}`);
    } else {
      console.log('❌ Task 8 NOT found in database');
    }

    // 检查 ContactKey
    const contactKey = await prisma.contactKey.findUnique({
      where: { taskId: '8' },
    });

    if (contactKey) {
      console.log('\n✅ ContactKey exists:');
      console.log(`   creatorWrappedDEK: ${contactKey.creatorWrappedDEK.substring(0, 30)}...`);
      console.log(`   helperWrappedDEK: ${contactKey.helperWrappedDEK ? contactKey.helperWrappedDEK.substring(0, 30) + '...' : 'N/A'}`);
    } else {
      console.log('\n❌ ContactKey NOT found for Task 8');
    }

    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTask8();
